#set text(size: 10pt)

#let point(x) = (x, calc.sqrt(x*x*x + 7))
#let opposite(x) = (x, -calc.sqrt(x*x*x + 7))


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
        legend: "inner-north-east",
        legend-style: (
            stroke: black,
            fill: none,
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
            plot.add-anchor("G", point(-1.85))
            plot.add-anchor("A", point(0.5))
            plot.add-anchor("B", point(2))
            plot.add-anchor("C", opposite(2))
        }
    )

    line("plot.G", "plot.B", stroke: (dash: "dashed", paint: color.darken(gray, 30%)))
    line("plot.B", "plot.C", stroke: (dash: "dashed", paint: color.darken(gray, 30%)))
    let display_point(name, anchor: "north-west") = {
      circle("plot."+name, radius: 0.1, fill: black, name:name)
      content(name, [= $#name$], anchor: anchor, padding: 0.1)
    }
    display_point("G")
    display_point("A")
    display_point("B")
    display_point("C", anchor: "south-west")
})