#include "Menu.h"
#include <iostream>
#include <fstream>
#include <sstream>

using namespace std;

// Fungsi untuk membaca data dari CSV dan mengisi Matriks Ketetanggaan
void bacaDataCSV(string namaFile, vector<vector<Jalur>>& graph) {
    ifstream file(namaFile);
    if (!file.is_open()) {
        cout << "Gagal membuka file " << namaFile << "!" << endl;
        return;
    }
    
    string line;
    // Membaca baris header dan membuangnya
    getline(file, line);
    
    while (getline(file, line)) {
        if (line.empty()) continue;
        
        stringstream ss(line);
        string asal_str, tujuan_str, jarak_str, rusak_mobil_str, nyaman_mobil_str, rusak_motor_str, nyaman_motor_str;
        
        getline(ss, asal_str, ',');
        getline(ss, tujuan_str, ',');
        getline(ss, jarak_str, ',');
        getline(ss, rusak_mobil_str, ',');
        getline(ss, nyaman_mobil_str, ',');
        getline(ss, rusak_motor_str, ',');
        getline(ss, nyaman_motor_str, ',');
        
        if (asal_str.empty() || tujuan_str.empty()) continue;

        // Konversi karakter lokasi menjadi indeks matriks
        int u = asal_str[0] - 'A';
        int v = tujuan_str[0] - 'A';
        
        int jarak = stoi(jarak_str);
        int rusak_mobil = stoi(rusak_mobil_str);
        int nyaman_mobil = stoi(nyaman_mobil_str);
        int rusak_motor = stoi(rusak_motor_str);
        int nyaman_motor = stoi(nyaman_motor_str);
        
        graph[u][v] = {jarak, rusak_mobil, nyaman_mobil, rusak_motor, nyaman_motor, 0.0, true};
        graph[v][u] = {jarak, rusak_mobil, nyaman_mobil, rusak_motor, nyaman_motor, 0.0, true};
    }
    file.close();
}

// Fungsi untuk menghitung bobot akhir sesuai jenis kendaraan
void hitungBobotSesuaiKendaraan(string kendaraan, vector<vector<Jalur>>& graph) {
    for (int i = 0; i < 26; ++i) {
        for (int j = 0; j < 26; ++j) {
            if (graph[i][j].ada) {
                int chosen_kerusakan = 0;
                int chosen_kenyamanan = 0;
                
                if (kendaraan == "Mobil" || kendaraan == "1") {
                    chosen_kerusakan = graph[i][j].rusak_mobil;
                    chosen_kenyamanan = graph[i][j].nyaman_mobil;
                } else {
                    chosen_kerusakan = graph[i][j].rusak_motor;
                    chosen_kenyamanan = graph[i][j].nyaman_motor;
                }
                
                // Menghitung bobot_akhir: bobot_akhir = (chosen_rusak * 0.6) + (chosen_nyaman * 0.4)
                graph[i][j].bobot_akhir = (chosen_kerusakan * 0.6) + (chosen_kenyamanan * 0.4);
            }
        }
    }
}

// Fungsi untuk menampilkan rute utama
void tampilkanRuteUtama(const RuteAlternatif& rute) {
    cout << "\n========================================================\n";
    cout << "             OUTPUT 1: RUTE PALING OPTIMAL              \n";
    cout << "========================================================\n";
    cout << "Rute Utama Terbaik:\n";
    cout << "Rute           : ";
    for (size_t i = 0; i < rute.path.size(); ++i) {
        cout << char(rute.path[i] + 'A');
        if (i < rute.path.size() - 1) cout << " -> ";
    }
    cout << "\nTotal Jarak    : " << rute.total_jarak << " satuan jarak";
    cout << "\nBobot Total    : " << rute.total_bobot << " (Semakin kecil semakin nyaman)\n";
    cout << "--------------------------------------------------------\n";
}

// Fungsi untuk menampilkan rute alternatif
void tampilkanRuteAlternatif(const vector<RuteAlternatif>& daftarAlternatif) {
    cout << "\n========================================================\n";
    cout << "             OUTPUT 2: RUTE ALTERNATIF (BACKUP)         \n";
    cout << "========================================================\n";
    
    if (daftarAlternatif.empty()) {
        cout << "Tidak ada rute cadangan lain yang tersedia." << endl;
    } else {
        for (size_t i = 0; i < daftarAlternatif.size(); ++i) {
            cout << "Alternatif " << i + 1 << ":" << endl;
            cout << "Rute           : ";
            for (size_t j = 0; j < daftarAlternatif[i].path.size(); ++j) {
                cout << char(daftarAlternatif[i].path[j] + 'A');
                if (j < daftarAlternatif[i].path.size() - 1) cout << " -> ";
            }
            cout << "\nTotal Jarak    : " << daftarAlternatif[i].total_jarak << " satuan jarak";
            cout << "\nBobot Total    : " << daftarAlternatif[i].total_bobot << " (Semakin kecil semakin nyaman)\n";
            cout << "--------------------------------------------------------\n";
        }
    }
}

// Fungsi untuk menampilkan Menu Utama
void tampilkanMenuUtama() {
    cout << "\n========================================================\n";
    cout << "  Pengembangan Sistem Navigasi Rute Berdasarkan Jarak   \n";
    cout << "           dan Kenyamanan dalam Berkendara              \n";
    cout << "========================================================\n";
    cout << "[1] Cari Rute Navigasi\n";
    cout << "[2] Keluar Program\n";
    cout << "Pilih menu (1/2): ";
}

// Fungsi untuk menjeda layar sebelum kembali ke menu
void tungguEnter() {
    cout << "\nTekan Enter untuk kembali ke menu utama...";
    cin.clear();
    cin.ignore(10000, '\n'); // Membersihkan buffer input sebelumnya
    cin.get(); // Menunggu user menekan Enter
}
