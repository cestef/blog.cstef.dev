#import "@preview/cetz:0.3.1": *
#import "@preview/cetz-plot:0.1.0": plot, chart

#set text(size: 10pt)

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
        y-tick-step: 1, 
        y-min: -1, 
        y-max: 5,
        x-min: 0,
        x-max: 4,
        x-grid: true,
        y-grid: true,
        legend: "inner-north-east",
        legend-style: (
            stroke: black,
            fill: white,
            radius: 5pt,
            padding: .5em,
        ),
        {
            plot.add-anchor("a_0", (0, 1))
            plot.add-anchor("a_1", (1, 3))
            plot.add-anchor("a_2", (2, 2))
            plot.add-anchor("a_3", (3, 4))
            let l1(x) = (x - 0) * (x - 2) * (x - 3) / 2
            let l2(x) = (x - 0) * (x - 1) * (x - 3) / -2
            let l3(x) = (x - 0) * (x - 1) * (x - 2) / 6
            let l0(x) = (x - 1) * (x - 2) * (x - 3) / -6
            plot.add(l0, domain: (0, 5), style: (stroke: fuchsia + 2pt), label: $ l_0 (x) $)
            plot.add(l1, domain: (0, 5), style: (stroke: blue + 2pt), label: $ l_1 (x) $)
            plot.add(l2, domain: (0, 5), style: (stroke: green + 2pt), label: $ l_2 (x) $)
            plot.add(l3, domain: (0, 5), style: (stroke: red + 2pt), label: $ l_3 (x) $)
        }
    )

    circle("plot.a_0", radius: 0.1, fill: fuchsia, name :"a_0")
    content("a_0", [= $A_0$], anchor: "south-west", padding: 0.1)
    circle("plot.a_1", radius: 0.1, fill: blue, name :"a_1")
    content("a_1", [= $A_1$], anchor: "north-west", padding: 0.1)
    circle("plot.a_2", radius: 0.1, fill: green, name :"a_2")
    content("a_2", [= $A_2$], anchor: "north-west", padding: 0.1)
    circle("plot.a_3", radius: 0.1, fill: red, name :"a_3")
    content("a_3", [= $A_3$], anchor: "north-west", padding: 0.1)
})