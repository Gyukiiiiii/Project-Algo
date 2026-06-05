#ifndef NAVIGASI_H
#define NAVIGASI_H

#include "Jalur.h"
#include <vector>

using namespace std;

bool ruteSama(const RuteAlternatif& r1, const RuteAlternatif& r2);
RuteAlternatif cariRuteDijkstra(int start, int dest, const vector<vector<Jalur>>& graph);
vector<RuteAlternatif> cariDaftarAlternatif(int start, int dest, vector<vector<Jalur>>& graph, const RuteAlternatif& ruteUtama);
void urutkanRute(vector<RuteAlternatif>& ruteList);

#endif // NAVIGASI_H
