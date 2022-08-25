---
title: Understanding Euler's Form of Complex Numbers Through the Lens of Compound Interest
date: 2022-05-22
layout: blog
excerpt: How might the idea of continuously compounding a quantity over an interval change when that quantity is complex? In this exploration, I demonstrate the link between complex multiplication and rotation.
pdfpath: /pdfs/EulerForm.pdf
---

This paper was a short assignment for IB Maths Higher Level Approaches and Analysis class. In our unit on complex numbers, we looked at a variety of representations, one of which being euler's (polar) form. In this exploration, which I wrote in a day, I coded a quick demonstration to show how evalutaing a problem about compounding interest reveals how 'e^ix' cooresponds to a rotation through x radians. If I were to do this project again, I would incorporate the proof of Euler's form using the taylor series expansion of e^ix, where separating the real and imaginary components yields the taylor expansion of cosine and sine respectively. To complete the visualizations, I used 3Blue1Brown's open-source python library Manim. The graphics were made with the code below:

```py
class ComplexExponential(Scene):
    def construct(self):
        axes = ComplexPlane()
        axes.add_coordinates()
        ucircle = Circle(color=GRAY).set_stroke(width=5, opacity=0.5).scale(2)

        def intervalValues(z, n):
            output = []
            for f in range(n + 1): # f ranges from 0 to n
                output.append(2*(1 + z / n) ** f)
            return output # return the sequence of values

        vectors = VGroup() # group of vector objects

        def addVectors(z, n):
            for k in range(1, n + 1,2): # for each integer up to n
                coords = intervalValues(z, k) # generate it's sequence
                for i in coords: # for every element in the sequence
                    vectors.add( # add a vector from the origin
                        Line(
                            start=ORIGIN,
                            end=complex_to_R3(i),
                            color=rgb_to_color(hsv_to_rgb(((k-1) / n), 0.5, 0.9)),
                        )
                        .add_tip(tip_length=0.1)
                        .set_stroke(width=2, opacity=0.7)
                    )

        addVectors(np.pi*2j, 100)
        self.add(axes, ucircle, vectors)
        self.interactive_embed()
```
