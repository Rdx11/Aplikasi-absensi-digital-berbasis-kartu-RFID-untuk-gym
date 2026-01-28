<?php

namespace App\Http\Controllers;

use App\Helpers\ImageHelper;
use App\Models\Member;
use App\Models\MembershipType;
use App\Models\UnregisteredRfid;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        // Update status expired untuk member yang sudah habis masa berlakunya
        Member::where('status', 'active')
            ->where('membership_end_date', '<', today())
            ->update(['status' => 'expired']);

        $query = Member::with('membershipType');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%")
                  ->orWhere('rfid_uid', 'like', "%{$request->search}%");
            });
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->membership_type) {
            $query->where('membership_type_id', $request->membership_type);
        }

        $members = $query->latest()->paginate(10)->withQueryString();
        $membershipTypes = MembershipType::where('is_active', true)->get();

        return Inertia::render('Members/Index', [
            'members' => $members,
            'membershipTypes' => $membershipTypes,
            'filters' => $request->only(['search', 'status', 'membership_type']),
        ]);
    }

    public function create(Request $request)
    {
        $membershipTypes = MembershipType::where('is_active', true)->get();
        $rfidUid = $request->query('rfid_uid', '');

        return Inertia::render('Members/Create', [
            'membershipTypes' => $membershipTypes,
            'rfidUid' => $rfidUid,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'rfid_uid' => 'required|string|max:20|unique:members,rfid_uid',
            'name' => 'required|string|max:100',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|numeric',
            'birth_date' => [
                'required',
                'date',
                'before:' . now()->subYears(10)->format('Y-m-d'),
            ],
            'gender' => 'nullable|in:male,female',
            'address' => 'nullable|string',
            'membership_type_id' => 'required|exists:membership_types,id',
            'membership_start_date' => 'required|date',
            'membership_end_date' => 'required|date|after_or_equal:membership_start_date',
            'status' => 'boolean',
            'photo' => 'nullable|image|max:2048',
        ], [
            'birth_date.required' => 'Tanggal lahir wajib diisi',
            'birth_date.before' => 'Member harus berusia minimal 10 tahun',
        ]);

        if ($request->hasFile('photo')) {
            // Compress dan simpan gambar (max 800px, quality 80%)
            $validated['photo'] = ImageHelper::compressAndStore($request->file('photo'), 'members', 800, 80);
        }

        $validated['status'] = $request->boolean('status') ? 'active' : 'inactive';
        $member = Member::create($validated);

        // Simpan transaksi registrasi member
        $membershipType = MembershipType::findOrFail($validated['membership_type_id']);
        \App\Models\MemberRegistration::create([
            'member_id' => $member->id,
            'membership_type_id' => $validated['membership_type_id'],
            'member_name' => $validated['name'],
            'price' => $membershipType->price,
            'membership_start_date' => $validated['membership_start_date'],
            'membership_end_date' => $validated['membership_end_date'],
        ]);

        // Update unregistered_rfids jika ada
        UnregisteredRfid::where('rfid_uid', $validated['rfid_uid'])
            ->update(['is_registered' => true, 'registered_at' => now()]);

        return redirect()->route('members.index')->with('success', 'Member berhasil ditambahkan');
    }

    public function edit(Member $member)
    {
        $membershipTypes = MembershipType::where('is_active', true)->get();

        return Inertia::render('Members/Edit', [
            'member' => $member,
            'membershipTypes' => $membershipTypes,
        ]);
    }

    public function update(Request $request, Member $member)
    {
        $validated = $request->validate([
            'rfid_uid' => 'required|string|max:20|unique:members,rfid_uid,' . $member->id . ',id',
            'name' => 'required|string|max:100',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|numeric',
            'birth_date' => [
                'required',
                'date',
                'before:' . now()->subYears(10)->format('Y-m-d'),
            ],
            'gender' => 'nullable|in:male,female',
            'address' => 'nullable|string',
            'membership_type_id' => 'required|exists:membership_types,id',
            'membership_start_date' => 'required|date',
            'membership_end_date' => 'required|date|after_or_equal:membership_start_date',
            'status' => 'boolean',
            'photo' => 'nullable|image|max:2048',
        ], [
            'birth_date.required' => 'Tanggal lahir wajib diisi',
            'birth_date.before' => 'Member harus berusia minimal 10 tahun',
        ]);

        if ($request->hasFile('photo')) {
            // Hapus foto lama jika ada
            if ($member->photo) {
                Storage::disk('public')->delete($member->photo);
            }
            // Compress dan simpan gambar baru (max 800px, quality 80%)
            $validated['photo'] = ImageHelper::compressAndStore($request->file('photo'), 'members', 800, 80);
        } elseif ($request->boolean('remove_photo')) {
            // Hapus foto jika user klik hapus foto
            if ($member->photo) {
                Storage::disk('public')->delete($member->photo);
            }
            $validated['photo'] = null;
        } else {
            // Jangan update foto jika tidak ada perubahan
            unset($validated['photo']);
        }

        $validated['status'] = $request->boolean('status') ? 'active' : 'inactive';
        $member->update($validated);

        return redirect()->route('members.index')->with('success', 'Member berhasil diupdate');
    }

    public function destroy(Member $member)
    {
        if ($member->photo) {
            Storage::disk('public')->delete($member->photo);
        }
        $member->delete();

        return redirect()->route('members.index')->with('success', 'Member berhasil dihapus');
    }

    public function renew(Request $request, Member $member)
    {
        $validated = $request->validate([
            'membership_type_id' => 'required|exists:membership_types,id',
            'notes' => 'nullable|string',
        ]);

        $membershipType = MembershipType::findOrFail($validated['membership_type_id']);
        
        $oldEndDate = $member->membership_end_date;
        $newStartDate = today();
        $newEndDate = today()->addDays($membershipType->duration_days);

        // Gunakan renewal_price jika ada, jika tidak gunakan price
        $renewalPrice = $membershipType->renewal_price ?? $membershipType->price;

        // Simpan data perpanjangan dengan member_name
        \App\Models\MemberRenewal::create([
            'member_id' => $member->id,
            'member_name' => $member->name,
            'membership_type_id' => $membershipType->id,
            'old_end_date' => $oldEndDate,
            'new_start_date' => $newStartDate,
            'new_end_date' => $newEndDate,
            'price' => $renewalPrice,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Update member
        $member->update([
            'membership_type_id' => $membershipType->id,
            'membership_start_date' => $newStartDate,
            'membership_end_date' => $newEndDate,
            'status' => 'active',
        ]);

        return redirect()->route('members.index')->with('success', 'Member berhasil diperpanjang');
    }
}
