#include "Navigasi.h"
#include <queue>

using namespace std;

// Fungsi bantuan untuk mengecek apakah dua rute adalah rute yang persis sama
bool ruteSama(const RuteAlternatif& r1, const RuteAlternatif& r2) {
    if (r1.path.size() != r2.path.size()) return false;
    for (size_t i = 0; i < r1.path.size(); ++i) {
        if (r1.path[i] != r2.path[i]) return false;
    }
    return true;
}

// Fungsi inti algoritma Dijkstra menggunakan Min-Heap (priority_queue)
RuteAlternatif cariRuteDijkstra(int start, int dest, const vector<vector<Jalur>>& graph) {
    int n = graph.size();
    
    vector<double> dist(n, INF);
    vector<int> parent(n, -1);
    
    // std::priority_queue (Min-Heap) untuk mengambil node dengan bobot terkecil secara efisien
    priority_queue<pair<double, int>, vector<pair<double, int>>, greater<pair<double, int>>> pq;
    
    dist[start] = 0; 
    pq.push({0.0, start});
    
    while (!pq.empty()) {
        double current_dist = pq.top().first;
        int u = pq.top().second;
        pq.pop();
        
        if (current_dist > dist[u]) continue;
        if (u == dest) break;
        
        // RELAKSASI DIJKSTRA
        for (int v = 0; v < n; ++v) {
            if (graph[u][v].ada) { 
                double weight = graph[u][v].bobot_akhir;
                
                if (dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    parent[v] = u; 
                    pq.push({dist[v], v});
                }
            }
        }
    }
    
    RuteAlternatif hasil;
    hasil.total_bobot = dist[dest];
    hasil.total_jarak = 0;
    
    if (dist[dest] == INF) {
        return hasil; 
    }
    
    int curr = dest;
    while (curr != -1) {
        hasil.path.push_back(curr);
        curr = parent[curr];
    }
    
    for (size_t i = 0; i < hasil.path.size() / 2; ++i) {
        swap(hasil.path[i], hasil.path[hasil.path.size() - 1 - i]);
    }
    
    for (size_t i = 0; i < hasil.path.size() - 1; ++i) {
        int u = hasil.path[i];
        int v = hasil.path[i+1];
        hasil.total_jarak += graph[u][v].jarak;
    }
    
    return hasil;
}

// Fungsi untuk mengumpulkan daftar rute alternatif dengan metode Edge Elimination
vector<RuteAlternatif> cariDaftarAlternatif(int start, int dest, vector<vector<Jalur>>& graph, const RuteAlternatif& ruteUtama) {
    vector<RuteAlternatif> daftarAlternatif;
    
    if (ruteUtama.path.empty()) return daftarAlternatif;
    
    // Iterasi memutus satu per satu tepi (edge) yang dilalui rute utama
    for (size_t i = 0; i < ruteUtama.path.size() - 1; ++i) {
        int u = ruteUtama.path[i];
        int v = ruteUtama.path[i+1];
        
        // 1. Matikan (blokir sementara) jalur ini
        graph[u][v].ada = false;
        graph[v][u].ada = false;
        
        // 2. Jalankan ulang Dijkstra 
        RuteAlternatif ruteBaru = cariRuteDijkstra(start, dest, graph);
        
        // 3. Tambahkan ke koleksi alternatif jika valid
        if (!ruteBaru.path.empty()) {
            bool duplikat = false;
            for (const auto& r : daftarAlternatif) {
                if (ruteSama(r, ruteBaru)) {
                    duplikat = true;
                    break;
                }
            }
            if (!duplikat) {
                daftarAlternatif.push_back(ruteBaru);
            }
        }
        
        // 4. Hidupkan kembali jalan
        graph[u][v].ada = true;
        graph[v][u].ada = true;
    }
    
    return daftarAlternatif;
}

// Implementasi algoritma Bubble Sort manual untuk mengurutkan alternatif rute berdasarkan bobot
void urutkanRute(vector<RuteAlternatif>& ruteList) {
    int n = ruteList.size();
    
    for (int i = 0; i < n - 1; ++i) {
        for (int j = 0; j < n - i - 1; ++j) {
            if (ruteList[j].total_bobot > ruteList[j + 1].total_bobot) {
                // Proses penukaran posisi array (swap)
                RuteAlternatif temp = ruteList[j];
                ruteList[j] = ruteList[j + 1];
                ruteList[j + 1] = temp;
            }
        }
    }
}
