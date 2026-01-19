<?php

namespace App\Http\Controllers;

use App\Models\DailyPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DailyPackageController extends Controller
{
    public function index()
    {
        $packages = DailyPackage::latest()->paginate(10);

        return Inertia::render('DailyPackages/Index', [
            'packages' => $packages,
        ]);
    }

    public function create()
    {
        return Inertia::render('DailyPackages/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $request->boolean('is_active');
        DailyPackage::create($validated);

        return redirect()->route('daily-packages.index')->with('success', 'Paket harian berhasil ditambahkan');
    }

    public function edit(DailyPackage $dailyPackage)
    {
        return Inertia::render('DailyPackages/Edit', [
            'package' => $dailyPackage,
        ]);
    }

    public function update(Request $request, DailyPackage $dailyPackage)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $request->boolean('is_active');
        $dailyPackage->update($validated);

        return redirect()->route('daily-packages.index')->with('success', 'Paket harian berhasil diupdate');
    }

    public function destroy(DailyPackage $dailyPackage)
    {
        $dailyPackage->delete();

        return redirect()->route('daily-packages.index')->with('success', 'Paket harian berhasil dihapus');
    }
}
