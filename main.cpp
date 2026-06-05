#include <iostream>
#include <vector>
#include <string>
#include "Jalur.h"
#include "Navigasi.h"
#include "Menu.h"

using namespace std;

int main() {
    // Matriks Ketetanggaan berukuran 26x26 untuk mewakili titik A sampai Z
    vector<vector<Jalur>> graph(26, vector<Jalur>(26));
    
    // Inisialisasi awal: anggap tidak ada satupun jalan yang terhubung
    for (int i = 0; i < 26; ++i) {
        for (int j = 0; j < 26; ++j) {
            graph[i][j].ada = false;
        }
    }
    
    // Membaca data dari CSV
    bacaDataCSV("data_rute.csv", graph);
    
    // MAIN MENU LOOP
    while (true) {
        tampilkanMenuUtama();
        
        string pilihan_menu;
        cin >> pilihan_menu;
        
        if (pilihan_menu == "2") {
            cout << "\nTerima kasih telah menggunakan Sistem Navigasi Universitas Jember!\n";
            break;
        } else if (pilihan_menu == "1") {
            char start_char, dest_char;
            string pilihan_kendaraan;
            int start, dest;
            string tipe_kendaraan;
            
            // Loop validasi input titik asal dan tujuan
            while (true) {
                cout << "\nMasukkan Titik Asal (A-Z)       : ";
                cin >> start_char;
                cout << "Masukkan Titik Tujuan (A-Z)     : ";
                cin >> dest_char;
                
                start = toupper(start_char) - 'A';
                dest = toupper(dest_char) - 'A';
                
                if (start >= 0 && start <= 25 && dest >= 0 && dest <= 25) {
                    break; // Input valid, keluar dari loop
                }
                
                // Menangani error input
                cin.clear();
                cin.ignore(10000, '\n');
                cout << "[!] Input tidak valid! Harap masukkan huruf antara A sampai Z.\n";
            }
            
            // Loop validasi input kendaraan
            while (true) {
                cout << "Pilih Kendaraan (1: Mobil / 2: Motor) : ";
                cin >> pilihan_kendaraan;
                
                if (pilihan_kendaraan == "1" || pilihan_kendaraan == "Mobil" || pilihan_kendaraan == "mobil") {
                    tipe_kendaraan = "Mobil";
                    break;
                } else if (pilihan_kendaraan == "2" || pilihan_kendaraan == "Motor" || pilihan_kendaraan == "motor") {
                    tipe_kendaraan = "Motor";
                    break;
                }
                
                // Menangani error input
                cin.clear();
                cin.ignore(10000, '\n');
                cout << "[!] Pilihan tidak valid! Masukkan angka 1 (Mobil) atau 2 (Motor).\n\n";
            }
            
            // Langkah 1: Hitung bobot setiap jalur sesuai kendaraan yang dipilih
            hitungBobotSesuaiKendaraan(tipe_kendaraan, graph);
            
            // Langkah 2: Cari rute paling optimal (Utama) menggunakan Dijkstra
            RuteAlternatif ruteUtama = cariRuteDijkstra(start, dest, graph);
            
            if (ruteUtama.path.empty()) {
                cout << "\nMaaf, rute terputus. Tidak ada jalan yang bisa dilalui dari " 
                     << char(start + 'A') << " ke " << char(dest + 'A') << "." << endl;
            } else {
                // Langkah 3: Tampilkan Rute Utama
                tampilkanRuteUtama(ruteUtama);
                
                // Langkah 4: Cari daftar rute alternatif dengan metode Edge Elimination
                vector<RuteAlternatif> daftarAlternatif = cariDaftarAlternatif(start, dest, graph, ruteUtama);
                
                // Langkah 5: Urutkan rute alternatif
                urutkanRute(daftarAlternatif);
                
                // Langkah 6: Tampilkan Rute Alternatif
                tampilkanRuteAlternatif(daftarAlternatif);
            }
            
            // Menunggu respon pengguna sebelum kembali ke menu
            tungguEnter();
            
        } else {
            // Input selain 1 dan 2
            cin.clear();
            cin.ignore(10000, '\n');
            cout << "\n[!] Pilihan tidak valid! Silakan masukkan 1 atau 2.\n";
        }
    }
    
    return 0;
}
