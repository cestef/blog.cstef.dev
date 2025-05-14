#show math.equation: set text(10pt)
#canvas({
  import draw: *
  
  let SCALE = 2
  let RADIUS = .15
  let c = (x,y,z) => {
    (x*SCALE,y*SCALE,z*SCALE)
  }
  
  line(c(0,0,0), c(1,0,0))
  line(c(0,0,0), c(0,1,0))
  line(c(0,0,0), c(0,0,1))
  line(c(1,0,0), c(1,0,1))
  line(c(1,0,0), c(1,1,0))
  line(c(0,1,0), c(0,1,1))
  line(c(0,1,0), c(1,1,0))
  line(c(0,0,1), c(0,1,1))
  line(c(0,0,1), c(1,0,1))
  line(c(1,0,1), c(1,1,1))
  line(c(1,1,1), c(0,1,1))
  line(c(1,1,0), c(1,1,1))

  circle(c(1,0,0), radius: RADIUS, fill: red, stroke: none)
  circle(c(0,1,0), radius: RADIUS, fill: red, stroke: none)
  circle(c(0,1,1), radius: RADIUS, fill: red, stroke: none)
  circle(c(1,0,1), radius: RADIUS, fill: red, stroke: none)
  circle(c(1,1,1), radius: RADIUS, fill: red, stroke: none)
  circle(c(0,0,0), radius: RADIUS, fill: red, stroke: none)
  
  circle(c(0,0,1), radius: RADIUS, fill: green, stroke: none)
  circle(c(1,1,0), radius: RADIUS, fill: green, stroke: none)

  content(c(0,-0.2,1), $(0,0,0)$)
  content(c(1,-0.2,1), $(1,0,0)$)
  content(c(1.4,0,0), $(1,0,0)$)
  content(c(1,1.2,0), $(1,1,1)$)
  content(c(-0.4,1,1), $(0,0,1)$)
  content(c(0,1.2,0), $(0,1,1)$)
})