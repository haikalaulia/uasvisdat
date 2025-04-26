// Memuat data dari CSV
d3.csv("data/sandwiches.csv").then(function(data) {
    // Konversi harga dari string ke angka
    data.forEach(d => {
        d.price = +d.price;  // Konversi ke tipe number
    });

    // Setup ukuran SVG
    const width = 600, height = 300;
    const svg = d3.select("#chart")
        .attr("width", width)
        .attr("height", height);

    const radiusSmall = 20;
    const radiusLarge = radiusSmall * 2;

    // Skala warna berdasarkan harga
    const colorScale = d3.scaleOrdinal()
        .domain([true, false])
        .range(["#4CAF50", "#FFA500"]);  // Hijau untuk harga < 7.00, oranye untuk harga >= 7.00

    // Skala posisi X otomatis
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([50, width - 50])
        .padding(0.5);

    // Menambahkan lingkaran berdasarkan data
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.name))
        .attr("cy", 100)
        .attr("r", d => d.size === "large" ? radiusLarge : radiusSmall)
        .attr("fill", d => colorScale(d.price < 7.00))
        .attr("stroke", "black");

    // Menambahkan label nama sandwich
    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => xScale(d.name))
        .attr("y", 170)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .text(d => d.name);
});
