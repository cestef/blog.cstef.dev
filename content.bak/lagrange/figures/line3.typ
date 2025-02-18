#set text(size: 10pt)
#let f(x) = -(11/6) * calc.pow(x, 2) - x/6 + 4;

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
        y-min: -5, 
        y-max: 5,
        x-min: -5,
        x-max: 5,
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
            plot.add(f, domain: (-5, 5), style: (stroke: blue + 2pt))
            plot.add-anchor("a_0", (1,2))
            plot.add-anchor("a_1", (-2,-3))
            plot.add-anchor("a_2", (0,4))
        }
    )
    circle("plot.a_0", radius: 0.1, fill: black, name :"a_0")
    content("a_0", [= $A_0$], anchor: "north-west", padding: 0.1)
    circle("plot.a_1", radius: 0.1, fill: black, name :"a_1")
    content("a_1", [= $A_1$], anchor: "north-west", padding: 0.1)
    circle("plot.a_2", radius: 0.1, fill: black, name :"a_2")
    content("a_2", [= $A_2$], anchor: "south-west", padding: 0.1)
})
