#import "@preview/fletcher:0.5.2" as fletcher: *

#diagram(
  spacing: (1em, 1em),  
  $
    P_1 edge("rr",y_1, "-|>")  && S = {y_1}, space  R = {P_1} \
    P_2 edge("rr", y_2, "-|>") && R edge("rr", "-|>", y_2 space checkmark) && S = {y_1, y_2}, space R= {P_1, P_2 }edge("rr", "-|>", S) && P_2 \
    P_k edge("rr", "-|>", y_k) && R edge("rr", "-|>", y_k space checkmark) && S = {y_1, y_2, ..., y_k} edge("rr", "-|>", S) && P_k \
    & space
  $
)