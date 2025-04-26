// Pilih elemen SVG yang ada dan tetapkan ukuran
const svg = d3.select("svg")
    .attr("width", 700)
    .attr("height", 550);

// Fungsi untuk memproses dan menggambar data kota
function processCities(data) {
    // Konversi data numerik dari string ke number
    data.forEach(d => {
        d.population = +d.population;
        d.x = +d.x;
        d.y = +d.y;
    });

    // Filter hanya kota yang merupakan bagian dari Uni Eropa
    const euCities = data.filter(d => d.eu === "true");

    if (euCities.length === 0) {
        console.warn("Tidak ada kota Uni Eropa dalam dataset.");
    }

    // Tambahkan jumlah kota ke dalam halaman
    d3.select("body")
        .append("p")
        .text(`Number of cities: ${euCities.length}`);

    // Gambar lingkaran dan label nama kota
    svg.selectAll("circle")
        .data(euCities)
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.population >= 1000000 ? 8 : 4)
        .attr("fill", "yellow")
        .attr("stroke", "black");

    svg.selectAll(".city-label")
        .data(euCities)
        .enter()
        .append("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y - 10) // Geser label ke atas
        .text(d => d.population >= 1000000 ? d.city : "")
        .attr("class", "city-label");
}

// Baca data kota dari CSV
d3.csv("Data/cities_and_population.csv")
    .then(processCities)
    .catch(error => console.error("Gagal membaca CSV:", error));
