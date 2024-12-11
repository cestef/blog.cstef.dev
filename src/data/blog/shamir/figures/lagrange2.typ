#set text(size: 10pt)

#let l1(x) = ((x - 3) * (x - 5) / (1 - 3) / (1 - 5)) * 50
#let l3(x) = ((x - 1) * (x - 5) / (3 - 1) / (3 - 5)) * 84
#let l5(x) = ((x - 1) * (x - 3) / (5 - 1) / (5 - 3)) * 142
#let f(x) = l1(x) + l3(x) + l5(x)

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
        y-min: -20, 
        y-max: 200,
        legend: "inner-north-west",
        legend-style: (
            stroke: black,
            fill: none,
            radius: 5pt,
            spacing: .25,
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

            plot.add(
                l1, 
                domain: domain, 
                label: $ l_1 (x) dot y_1 $,
                style: (
                    stroke: red + 1pt
                ),
                line: "spline",
            )
            plot.add(
                l3, 
                domain: domain, 
                label: $ l_3 (x) dot y_3 $,
                style: (
                    stroke: green + 1pt
                ),
                line: "spline",
            )

            plot.add(
                l5, 
                domain: domain, 
                label: $ l_5 (x) dot y_5 $,
                line: "spline",
            )
            
            plot.add-anchor("s_1", (1, 50))
            plot.add-anchor("s_3", (3, 84))
            plot.add-anchor("s_5", (5, 142))
        }
    )

    circle("plot.s_1", radius: 0.1, fill: black, name :"s_1")
    content("s_1", [= $S_1$], anchor: "north-west", padding: 0.1)
    circle("plot.s_3", radius: 0.1, fill: black, name :"s_3")
    content("s_3", [= $S_3$], anchor: "north-west", padding: 0.1)
    circle("plot.s_5", radius: 0.1, fill: black, name :"s_5")
    content("s_5", [= $S_5$], anchor: "north-west", padding: 0.1)

})