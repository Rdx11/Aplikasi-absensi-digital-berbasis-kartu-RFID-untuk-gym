<?php

namespace App\Http\Controllers;

use App\Models\MembershipType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MembershipTypeController extends Controller
{
    public function index()
    {
        $membershipTypes = MembershipType::withCount('members')
            ->latest()
            ->paginate(10);

        return Inertia::render('MembershipTypes/Index', [
            'membershipTypes' => $membershipTypes,
        ]);
    }

    public function create()
    {
        return Inertia::render('MembershipTypes/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'duration_type' => 'required|in:daily,monthly,6_months,yearly',
            'duration_days' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'renewal_price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);
        MembershipType::create($validated);

        return redirect()->route('membership-types.index')->with('success', 'Jenis membership berhasil ditambahkan');
    }

    public function edit(MembershipType $membershipType)
    {
        return Inertia::render('MembershipTypes/Edit', [
            'membershipType' => $membershipType,
        ]);
    }

    public function update(Request $request, MembershipType $membershipType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'duration_type' => 'required|in:daily,monthly,6_months,yearly',
            'duration_days' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'renewal_price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);
        $membershipType->update($validated);

        return redirect()->route('membership-types.index')->with('success', 'Jenis membership berhasil diupdate');
    }

    public function destroy(MembershipType $membershipType)
    {
        if ($membershipType->members()->count() > 0) {
            return redirect()->route('membership-types.index')->with('error', 'Tidak dapat menghapus jenis membership yang masih digunakan');
        }

        $membershipType->delete();

        return redirect()->route('membership-types.index')->with('success', 'Jenis membership berhasil dihapus');
    }
}
