#set text(size: 10pt)

#let point(x) = (x, calc.sqrt(x*x*x + 7))
#let opposite(x) = (x, -calc.sqrt(x*x*x + 7))
#let slope(x,y) = (3*x*x)/(2*y)
#let tangent(xi, yi) = (x) => slope(xi, yi)* (x - xi) + yi

#canvas({
    import draw: *

    
    set-style(
        axes: (
            stroke: .5pt, 
            tick: (
                stroke: .5pt
            )
        ),
        legend: (
            stroke: none, 
            orientation: ttb, 
            item: (
                spacing: .3
            ), 
            scale: 80%
        ),
        mark: (
          transform-shape: false,
          fill: color.darken(gray, 30%)
        )
    )

    plot.plot(
        name: "plot",
        size: (12, 8),
        axis-style: "school-book",
        x-tick-step: 3,
        y-tick-step: 2,
        y-min: -6, y-max: 6,
        legend: "inner-north-east",
        legend-style: (
            stroke: black,
            fill: white,
            radius: 5pt,
            padding: .5em,
        ),
        {
            add-contour(
                x-domain: (-5, 7),
                y-domain: (-6, 6),
                op: "<",
                z: 0,
                x-samples: 50,
                y-samples: 50,
                style: (
                    stroke: blue + 2pt
                ),
                label: $ space y^2 = x^3 + 7 $,
                (x, y) => y * y - (x * x * x + 7)
            )
            let G = point(-.75)
            let t1 = tangent(G.at(0), G.at(1))
            let t2 = tangent(1.6, opposite(1.6).at(1))
            plot.add-anchor("G", G)
            plot.add-anchor("2G", point(1.6))
            plot.add-anchor("2G'", opposite(1.6))
            plot.add(t1, domain: (-5, 7), style: (stroke: green + 2pt, dash: "dashed"), label: $space t_G (x)$)
            plot.add(t2, domain: (-5, 7), style: (stroke: red + 2pt, dash: "dashed"), label: $space t_(2 G) (x)$)
            plot.add-anchor("3G", point(-1.87))
        }
    )
    line("plot.2G", "plot.2G'", stroke: (dash: "dashed", paint: color.darken(gray, 30%)))
    
    let display_point(name, anchor: "north-west", display: none) = {
      circle("plot."+name, radius: 0.1, fill: black, name:name)
      content(name, if (display != none){[#display]}else[= $#name$], anchor: anchor, padding: 0.1)
    }
    display_point("G", anchor: "south-east")
    display_point("2G", anchor: "south-east", display: [= $2 dot G$])
    display_point("2G'", anchor: "south-west", display: [= $(2 dot G)'$])
    display_point("3G", anchor: "south-west", display: [= $space 3 dot G$])
})