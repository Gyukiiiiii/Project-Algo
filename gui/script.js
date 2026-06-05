// Data Rute CSV embedded to avoid local file CORS issues
const csvData = `Asal,Tujuan,Jarak,Rusak_Mobil,Nyaman_Mobil,Rusak_Motor,Nyaman_Motor
A,B,10,4,3,2,4
A,C,15,3,4,1,3
B,D,20,5,2,9,1
C,D,10,2,4,3,3
B,C,5,1,5,1,5
C,E,25,4,3,8,1
D,E,5,2,4,1,4
A,E,50,6,2,9,1
B,E,35,4,3,2,4
E,F,12,3,4,2,4
E,G,18,4,3,5,2
F,H,14,2,4,3,4
G,H,22,4,2,6,2
H,I,8,1,5,2,4
G,I,15,3,3,4,3
I,J,30,5,2,7,2
H,J,25,4,3,5,3
J,K,10,2,4,1,5
I,K,18,3,4,4,3
J,F,12,3,4,2,4
K,G,18,4,3,5,2`;

const INF = Infinity;
const NUM_NODES = 26;

// Helper to convert char to index
function charToIndex(c) {
    return c.charCodeAt(0) - 'A'.charCodeAt(0);
}

// Helper to convert index to char
function indexToChar(i) {
    return String.fromCharCode(i + 'A'.charCodeAt(0));
}

let graph = Array.from({ length: NUM_NODES }, () =>
    Array.from({ length: NUM_NODES }, () => ({ ada: false }))
);
let nodesInUse = new Set();

// Parse CSV and populate graph
function parseData() {
    const lines = csvData.trim().split('\n').slice(1); // skip header
    for (let line of lines) {
        if (!line) continue;
        const [asal, tujuan, jarakStr, r_mobilStr, n_mobilStr, r_motorStr, n_motorStr] = line.split(',');

        const u = charToIndex(asal);
        const v = charToIndex(tujuan);

        nodesInUse.add(asal);
        nodesInUse.add(tujuan);

        const edgeData = {
            jarak: parseInt(jarakStr),
            rusak_mobil: parseInt(r_mobilStr),
            nyaman_mobil: parseInt(n_mobilStr),
            rusak_motor: parseInt(r_motorStr),
            nyaman_motor: parseInt(n_motorStr),
            bobot_akhir: 0,
            ada: true
        };

        graph[u][v] = { ...edgeData };
        graph[v][u] = { ...edgeData };
    }
}

// Calculate weights based on vehicle
function updateWeights(vehicle) {
    for (let i = 0; i < NUM_NODES; i++) {
        for (let j = 0; j < NUM_NODES; j++) {
            if (graph[i][j].ada) {
                let r = vehicle === 'Mobil' ? graph[i][j].rusak_mobil : graph[i][j].rusak_motor;
                let n = vehicle === 'Mobil' ? graph[i][j].nyaman_mobil : graph[i][j].nyaman_motor;
                graph[i][j].bobot_akhir = (r * 0.6) + (n * 0.4);
            }
        }
    }
}

// Min-Heap simplified for Dijkstra (using simple array sort since N=26 is very small)
function dijkstra(start, dest) {
    let dist = new Array(NUM_NODES).fill(INF);
    let parent = new Array(NUM_NODES).fill(-1);
    let visited = new Array(NUM_NODES).fill(false);

    dist[start] = 0;

    for (let i = 0; i < NUM_NODES; i++) {
        // Find min dist node
        let u = -1;
        let minDist = INF;
        for (let j = 0; j < NUM_NODES; j++) {
            if (!visited[j] && dist[j] < minDist) {
                minDist = dist[j];
                u = j;
            }
        }

        if (u === -1 || u === dest) break;
        visited[u] = true;

        for (let v = 0; v < NUM_NODES; v++) {
            if (graph[u][v].ada && !visited[v]) {
                let weight = graph[u][v].bobot_akhir;
                if (dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    parent[v] = u;
                }
            }
        }
    }

    let path = [];
    let totalJarak = 0;
    let totalBobot = dist[dest];

    if (dist[dest] === INF) return { path, total_jarak: 0, total_bobot: INF };

    let curr = dest;
    while (curr !== -1) {
        path.push(curr);
        curr = parent[curr];
    }
    path.reverse();

    for (let i = 0; i < path.length - 1; i++) {
        totalJarak += graph[path[i]][path[i + 1]].jarak;
    }

    return { path, total_jarak: totalJarak, total_bobot: totalBobot.toFixed(2) };
}

function pathsEqual(p1, p2) {
    if (p1.length !== p2.length) return false;
    for (let i = 0; i < p1.length; i++) {
        if (p1[i] !== p2[i]) return false;
    }
    return true;
}

function cariAlternatif(start, dest, ruteUtama) {
    let alternatif = [];
    if (ruteUtama.path.length === 0) return alternatif;

    for (let i = 0; i < ruteUtama.path.length - 1; i++) {
        let u = ruteUtama.path[i];
        let v = ruteUtama.path[i + 1];

        // Remove edge
        graph[u][v].ada = false;
        graph[v][u].ada = false;

        let ruteBaru = dijkstra(start, dest);

        if (ruteBaru.path.length > 0) {
            let isDuplicate = false;
            if (pathsEqual(ruteBaru.path, ruteUtama.path)) isDuplicate = true;
            for (let r of alternatif) {
                if (pathsEqual(r.path, ruteBaru.path)) isDuplicate = true;
            }
            if (!isDuplicate) alternatif.push(ruteBaru);
        }

        // Restore edge
        graph[u][v].ada = true;
        graph[v][u].ada = true;
    }

    alternatif.sort((a, b) => parseFloat(a.total_bobot) - parseFloat(b.total_bobot));
    return alternatif;
}

// Setup DOM
document.addEventListener('DOMContentLoaded', () => {
    parseData();

    const startSelect = document.getElementById('startNode');
    const destSelect = document.getElementById('destNode');

    let sortedNodes = Array.from(nodesInUse).sort();

    sortedNodes.forEach(node => {
        let opt1 = document.createElement('option');
        opt1.value = node;
        opt1.textContent = node;
        startSelect.appendChild(opt1);

        let opt2 = document.createElement('option');
        opt2.value = node;
        opt2.textContent = node;
        destSelect.appendChild(opt2);
    });

    if (sortedNodes.length > 1) {
        destSelect.value = sortedNodes[sortedNodes.length - 1]; // Set default dest
    }

    // Render peta dasar secara instan saat halaman pertama kali dimuat
    updateWeights('Mobil');
    renderGraphVisualization({ path: [] }, []);

    document.getElementById('navForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const start = startSelect.value;
        const dest = destSelect.value;
        const vehicle = document.querySelector('input[name="vehicle"]:checked').value;

        if (start === dest) {
            alert('Titik Asal dan Tujuan tidak boleh sama!');
            return;
        }

        updateWeights(vehicle);

        const startIdx = charToIndex(start);
        const destIdx = charToIndex(dest);

        const ruteUtama = dijkstra(startIdx, destIdx);
        const ruteAlternatif = cariAlternatif(startIdx, destIdx, ruteUtama);

        renderResults(ruteUtama, ruteAlternatif);
    });
});

function renderResults(ruteUtama, ruteAlternatif) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.style.display = 'flex';
    resultsContainer.innerHTML = '';

    if (ruteUtama.path.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">Tidak ada rute yang ditemukan.</div>';
        return;
    }

    // Helper to format path
    const formatPath = (path) => path.map(indexToChar).join(' <span style="color:var(--text-muted)">→</span> ');

    // Main Route Card
    let html = `
        <div class="route-card" style="border-color: var(--primary);">
            <div class="route-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                RUTE PALING OPTIMAL (UTAMA)
            </div>
            <div class="route-path">${formatPath(ruteUtama.path)}</div>
            <div class="route-stats">
                <div class="stat">
                    <span class="stat-label">Total Jarak</span>
                    <span class="stat-value">${ruteUtama.total_jarak} satuan</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Bobot Total</span>
                    <span class="stat-value" style="color: var(--primary)">${ruteUtama.total_bobot}</span>
                </div>
            </div>
        </div>
    `;

    if (ruteAlternatif.length === 0) {
        html += '<div class="no-results">Tidak ada rute alternatif (cadangan) yang tersedia.</div>';
    } else {
        const terbaik = ruteAlternatif[0];
        html += `
            <div class="route-card">
                <div class="route-title alt">RUTE ALTERNATIF (TERBAIK)</div>
                <div class="route-path">${formatPath(terbaik.path)}</div>
                <div class="route-stats">
                    <div class="stat">
                        <span class="stat-label">Total Jarak</span>
                        <span class="stat-value">${terbaik.total_jarak} satuan</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Bobot Total</span>
                        <span class="stat-value" style="color: var(--accent)">${terbaik.total_bobot}</span>
                    </div>
                </div>
            </div>
        `;
    }

    resultsContainer.innerHTML = html;
    renderGraphVisualization(ruteUtama, ruteAlternatif);

    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderGraphVisualization(ruteUtama, ruteAlternatif) {
    const svg = document.getElementById('graphSvg');
    const width = 520;
    const height = 420;

    // Definisi koordinat geografis manual agar terlihat seperti peta jalan nyata
    const mapCoordinates = {
        A: { x: 40, y: 210 },
        B: { x: 120, y: 90 },
        C: { x: 120, y: 330 },
        D: { x: 200, y: 210 },
        E: { x: 280, y: 210 },
        F: { x: 360, y: 90 },
        G: { x: 360, y: 330 },
        H: { x: 420, y: 210 },
        I: { x: 480, y: 330 },
        J: { x: 480, y: 90 },
        K: { x: 500, y: 210 }
    };

    // Siapkan list edge
    const edges = [];
    const mainRouteEdges = new Set();
    const altRouteEdges = new Set();

    // Mapping edge rute utama
    if (ruteUtama && ruteUtama.path.length > 1) {
        for (let i = 0; i < ruteUtama.path.length - 1; i++) {
            const u = indexToChar(ruteUtama.path[i]);
            const v = indexToChar(ruteUtama.path[i + 1]);
            mainRouteEdges.add([u, v].sort().join('-'));
        }
    }

    // Mapping edge rute alternatif pertama saja (Rute Alternatif Terbaik)
    if (ruteAlternatif && ruteAlternatif.length > 0) {
        const r = ruteAlternatif[0];
        if (r.path.length > 1) {
            for (let i = 0; i < r.path.length - 1; i++) {
                const u = indexToChar(r.path[i]);
                const v = indexToChar(r.path[i + 1]);
                altRouteEdges.add([u, v].sort().join('-'));
            }
        }
    }

    // Kumpulkan seluruh data jalan dari graph
    for (let i = 0; i < NUM_NODES; i++) {
        for (let j = i + 1; j < NUM_NODES; j++) {
            if (graph[i][j].ada) {
                const u = indexToChar(i);
                const v = indexToChar(j);
                if (mapCoordinates[u] && mapCoordinates[v]) {
                    edges.push({
                        u, v,
                        jarak: graph[i][j].jarak,
                        bobot: graph[i][j].bobot_akhir
                    });
                }
            }
        }
    }

    // Bangun elemen SVG
    const svgContent = [];

    // Definisikan pola grid peta dan gradien warna pin lokasi
    svgContent.push(`
        <defs>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1"/>
            </pattern>
            <linearGradient id="pinGradientDefault" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#94a3b8" />
                <stop offset="100%" stop-color="#475569" />
            </linearGradient>
            <linearGradient id="pinGradientStart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#38bdf8" />
                <stop offset="100%" stop-color="#0284c7" />
            </linearGradient>
            <linearGradient id="pinGradientDest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#f43f5e" />
                <stop offset="100%" stop-color="#be123c" />
            </linearGradient>
        </defs>
    `);

    // Grid peta
    svgContent.push(`<rect width="100%" height="100%" class="map-grid" />`);

    // 1. Gambar jalan raya standar (sebagai background)
    edges.forEach(edge => {
        const from = mapCoordinates[edge.u];
        const to = mapCoordinates[edge.v];

        // Jalan aspal tebal (road-bg)
        svgContent.push(`
            <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"
                class="road-bg"
                stroke-width="12" />
        `);
        // Bagian tengah jalan (road-casing)
        svgContent.push(`
            <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"
                class="road-casing"
                stroke-width="10" />
        `);
        // Garis marka jalan putus-putus
        svgContent.push(`
            <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"
                class="road-line"
                stroke-width="1.5" />
        `);
    });

    // 2. Gambar rute aktif (Lampu neon yang menyala di atas jalan)
    // Gambar rute alternatif dulu agar rute utama berada paling atas
    edges.forEach(edge => {
        const key = [edge.u, edge.v].sort().join('-');
        const isMain = mainRouteEdges.has(key);
        const isAlt = altRouteEdges.has(key) && !isMain;

        if (isAlt) {
            const from = mapCoordinates[edge.u];
            const to = mapCoordinates[edge.v];
            svgContent.push(`
                <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"
                    class="road-alt-bg"
                    stroke-width="14" />
                <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"
                    class="road-alt-core"
                    stroke-width="6" />
            `);
        }
    });

    edges.forEach(edge => {
        const key = [edge.u, edge.v].sort().join('-');
        const isMain = mainRouteEdges.has(key);

        if (isMain) {
            const from = mapCoordinates[edge.u];
            const to = mapCoordinates[edge.v];
            svgContent.push(`
                <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"
                    class="road-active-bg"
                    stroke-width="14" />
                <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"
                    class="road-active-core"
                    stroke-width="6" />
            `);
        }
    });

    // 3. Tampilkan angka jarak jalan (Road labels)
    edges.forEach(edge => {
        const from = mapCoordinates[edge.u];
        const to = mapCoordinates[edge.v];
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;

        // Background label agar terbaca jelas
        svgContent.push(`
            <rect x="${midX - 10}" y="${midY - 8}" width="20" height="12" rx="3" fill="#0b0f19" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/>
            <text x="${midX}" y="${midY + 1}" class="road-label">${edge.jarak}</text>
        `);
    });

    // 4. Gambar pin lokasi di setiap node
    const startNodeLetter = ruteUtama && ruteUtama.path.length > 0 ? indexToChar(ruteUtama.path[0]) : null;
    const destNodeLetter = ruteUtama && ruteUtama.path.length > 0 ? indexToChar(ruteUtama.path[ruteUtama.path.length - 1]) : null;

    Object.keys(mapCoordinates).forEach(node => {
        const { x, y } = mapCoordinates[node];
        const isStart = node === startNodeLetter;
        const isDest = node === destNodeLetter;

        let pinClass = "node-pin";
        let pinGradient = "url(#pinGradientDefault)";

        if (isStart) {
            pinClass += " start-pin";
            pinGradient = "url(#pinGradientStart)";
        } else if (isDest) {
            pinClass += " dest-pin";
            pinGradient = "url(#pinGradientDest)";
        }

        // Draw shadow under the pin
        svgContent.push(`
            <ellipse cx="${x}" cy="${y + 1}" rx="8" ry="3" class="node-shadow" />
        `);

        // Draw Location Pin (SVG Path pointing to x, y)
        svgContent.push(`
            <g class="${pinClass}" transform="translate(0, 0)">
                <path d="M ${x} ${y} 
                         C ${x - 8} ${y - 10} ${x - 10} ${y - 18} ${x - 10} ${y - 22} 
                         A 10 10 0 1 1 ${x + 10} ${y - 22} 
                         C ${x + 10} ${y - 18} ${x + 8} ${y - 10} ${x} ${y} Z" 
                      fill="${pinGradient}" />
                <circle cx="${x}" cy="${y - 22}" r="3" fill="#ffffff" />
                <text x="${x}" y="${y - 32}" class="pin-node-name" text-anchor="middle">${node}</text>
            </g>
        `);
    });

    svg.innerHTML = svgContent.join('');
}

