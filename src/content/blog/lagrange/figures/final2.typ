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
            fill: none,
            radius: 5pt,
            padding: .5em,
        ),
        {
            plot.add-anchor("a_0", (0, 1))
            plot.add-anchor("a_1", (1, 3))
            plot.add-anchor("a_2", (2, 2))
            plot.add-anchor("a_3", (3, 4))
            let l0(x) = ((x - 1) * (x - 2) * (x - 3) / -6) * 1
            let l1(x) = ((x - 0) * (x - 2) * (x - 3) / 2) * 3
            let l2(x) = ((x - 0) * (x - 1) * (x - 3) / -2) * 2
            let l3(x) = ((x - 0) * (x - 1) * (x - 2) / 6) * 4
            let P3(x) = l0(x) + l1(x) + l2(x) + l3(x)
            plot.add(P3, domain: (0, 5), style: (stroke: blue + 2pt), label: $ P_3 (x) $)
        }
    )

    circle("plot.a_0", radius: 0.1, fill: black, name :"a_0")
    content("a_0", [= $A_0$], anchor: "north-west", padding: 0.1)
    circle("plot.a_1", radius: 0.1, fill: black, name :"a_1")
    content("a_1", [= $A_1$], anchor: "south-west", padding: 0.1)
    circle("plot.a_2", radius: 0.1, fill: black, name :"a_2")
    content("a_2", [= $A_2$], anchor: "north", padding: 0.25)
    circle("plot.a_3", radius: 0.1, fill: black, name :"a_3")
    content("a_3", [= $A_3$], anchor: "north-west", padding: 0.1)
})