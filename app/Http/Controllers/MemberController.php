<?php

namespace App\Http\Controllers;

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
            'rfid_uid' => 'required|string|unique:members,rfid_uid',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'address' => 'nullable|string',
            'membership_type_id' => 'required|exists:membership_types,id',
            'membership_start_date' => 'required|date',
            'membership_end_date' => 'required|date|after_or_equal:membership_start_date',
            'status' => 'boolean',
            'photo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('members', 'public');
        }

        $validated['status'] = $request->boolean('status') ? 'active' : 'inactive';
        Member::create($validated);

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
            'rfid_uid' => 'required|string|unique:members,rfid_uid,' . $member->id,
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:male,female',
            'address' => 'nullable|string',
            'membership_type_id' => 'required|exists:membership_types,id',
            'membership_start_date' => 'required|date',
            'membership_end_date' => 'required|date|after_or_equal:membership_start_date',
            'status' => 'boolean',
            'photo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            if ($member->photo) {
                Storage::disk('public')->delete($member->photo);
            }
            $validated['photo'] = $request->file('photo')->store('members', 'public');
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
}
