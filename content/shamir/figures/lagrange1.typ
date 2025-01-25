#set text(size: 10pt)
#let f(x) = 42 + 5 * x + 3 * calc.pow(x, 2)

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
    )

    plot.plot(
        name: "plot",
        size: (12, 8),
        axis-style: "school-book",
        x-tick-step: 1,
        y-tick-step: 50, 
        y-min: 0, 
        y-max: 200,
        legend: "inner-north-east",
        legend-style: (
            stroke: black,
            fill: none,
            radius: 5pt,
            padding: .5em,
        ),
    
        {
            let domain = (0, 6)
            plot.add(
                f, 
                domain: domain, 
                label: $ f(x)  $,
                style: (
                    stroke: blue + 2pt
                ),
                line: "spline",
            )
            plot.add-anchor("s_1", (1, 50))
            plot.add-anchor("s_2", (2, 64))
            plot.add-anchor("s_3", (3, 84))
            plot.add-anchor("s_4", (4, 110))
            plot.add-anchor("s_5", (5, 142))
        }
    )

    circle("plot.s_1", radius: 0.1, fill: black, name :"s_1")
    content("s_1", [= $S_1$], anchor: "north-west", padding: 0.1)
    circle("plot.s_2", radius: 0.1, fill: black, name :"s_2")
    content("s_2", [= $S_2$], anchor: "north-west", padding: 0.1)
    circle("plot.s_3", radius: 0.1, fill: black, name :"s_3")
    content("s_3", [= $S_3$], anchor: "north-west", padding: 0.1)
    circle("plot.s_4", radius: 0.1, fill: black, name :"s_4")
    content("s_4", [= $S_4$], anchor: "north-west", padding: 0.1)
    circle("plot.s_5", radius: 0.1, fill: black, name :"s_5")
    content("s_5", [= $S_5$], anchor: "north-west", padding: 0.1)
})