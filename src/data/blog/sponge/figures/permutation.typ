#import "@preview/fletcher:0.5.2" as fletcher: *

#diagram(
  spacing: (15mm, 0mm),
  cell-size: (0mm, 0mm),
  node-stroke: 1pt,
  node-shape: rect,
  node((-6mm, 85pt), $r space cases(,,,,,,)$, stroke: none),
  node((-6mm, 21pt), $c space cases(,,,)$, stroke: none),
  node((35mm, 85pt), [#rotate(180deg)[$#rotate(180deg, $r'$) cases(,,,,,,)$]] , stroke: none),
  node((35mm, 21pt), [#rotate(180deg)[$#rotate(180deg, $c'$) cases(,,,)$]] , stroke: none),
  node((0,0), "1"),
  node((0,1), "0"),
  node((0,2), "1"),
  node((0,3), "0"),
  node((0,4), "0"),
  node((0,5), "1"),

  node((1,0), "1"),
  node((1,1), "1"),
  node((1,2), "0"),
  node((1,3), "1"),
  node((1,4), "0"),
  node((1,5), "0"),

  edge((0,0), (1,1.2), "-|>"),
  edge((0,.6), (1,4.5), "-|>"),
  edge((0,2.4), (1,-.8), "-|>"),
  edge((0,3), (1,1.8), "-|>"),
  edge((0,4), (1,5.2), "-|>"),
  edge((0,5), (1,2.6), "-|>"),
  node((14mm,.1mm), $f$, stroke: none)
)