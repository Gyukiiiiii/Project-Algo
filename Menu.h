#ifndef MENU_H
#define MENU_H

#include "Jalur.h"
#include <string>
#include <vector>

using namespace std;

void bacaDataCSV(string namaFile, vector<vector<Jalur>>& graph);
void hitungBobotSesuaiKendaraan(string kendaraan, vector<vector<Jalur>>& graph);
void tampilkanRuteUtama(const RuteAlternatif& rute);
void tampilkanRuteAlternatif(const vector<RuteAlternatif>& daftarAlternatif);
void tampilkanMenuUtama();
void tungguEnter();

#endif // MENU_H
