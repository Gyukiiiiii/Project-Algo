#ifndef JALUR_H
#define JALUR_H

#include <vector>
#include <string>
#include <limits>

using namespace std;

const double INF = numeric_limits<double>::infinity();

// Struktur data untuk menyimpan informasi jalur dengan penilaian terpisah untuk Mobil dan Motor
struct Jalur {
    int jarak;
    int rusak_mobil;
    int nyaman_mobil;
    int rusak_motor;
    int nyaman_motor;
    double bobot_akhir;
    bool ada; // Penanda apakah jalur ini terhubung (ada edge)
};

// Struktur data untuk menyimpan rute hasil pencarian
struct RuteAlternatif {
    vector<int> path; // Menyimpan urutan node yang dikunjungi (0-25)
    int total_jarak;  // Total jarak dalam satuan yang ada di CSV
    double total_bobot; // Total bobot berdasarkan rumus
};

#endif // JALUR_H
