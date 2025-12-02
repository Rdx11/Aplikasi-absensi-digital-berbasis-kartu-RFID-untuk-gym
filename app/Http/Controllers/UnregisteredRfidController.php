<?php

namespace App\Http\Controllers;

use App\Models\UnregisteredRfid;
use Inertia\Inertia;

class UnregisteredRfidController extends Controller
{
    public function index()
    {
        $unregistered = UnregisteredRfid::where('is_registered', false)
            ->latest('scan_time')
            ->paginate(15);

        return Inertia::render('Unregistered/Index', [
            'unregistered' => $unregistered,
        ]);
    }

    public function destroy(UnregisteredRfid $unregisteredRfid)
    {
        $unregisteredRfid->delete();

        return redirect()->route('unregistered.index')->with('success', 'Data RFID berhasil dihapus');
    }
}
