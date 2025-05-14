#show math.equation: set text(10pt)
#canvas({
  import draw: *
  let SCALE = 2
  let RADIUS = .15
  let c = (x,y,z) => {
    (x*SCALE,y*SCALE,z*SCALE)
  }
  line(c(0,0,0), c(1,0,0))

  circle(c(0,0,0), radius: RADIUS, fill: green, stroke: none)
  circle(c(1,0,0), radius: RADIUS, fill: green, stroke: none)

  content(c(0,-.2,0), $(0)$)
  content(c(1,-.2,0), $(1)$)
})