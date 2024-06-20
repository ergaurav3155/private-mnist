from nada_dsl import *

fp_scale = Integer(12)

def sum(x):
    if len(x) == 1:
        return x[0]
    return sum(x[:len(x)//2]) + sum(x[len(x)//2:])

def matmul(w, x):
    z = []
    for i in range(len(w)):
        z.append([])
        for j in range(len(x)):
            z[i].append(w[i][j] * x[j])
    for i in range(len(z)):
        z[i] = sum(z[i])
    
    # for i in range(len(z)):
    #     z[i] = z[i].trunc_pr(fp_scale)
    return z

def add(x, y):
    z = []
    for i in range(len(x)):
        z.append(x[i] + y[i])
    return z

def relu(x):
    z = []
    for i in range(len(x)):
        drelu = (x[i] > Integer(0))
        z.append(drelu.if_else(x[i], Integer(0)))
    return z

def argmax(x):
    max_val = x[0]
    max_idx = Integer(0)
    for i in range(1, len(x)):
        compare = (x[i] > max_val)
        max_val = compare.if_else(x[i], max_val)
        max_idx = compare.if_else(Integer(i), max_idx)
    return max_idx

def nada_main():

    weight_party = Party(name="Party0")
    input_party = Party(name="Party1")

    w1 = []
    for i in range(10):
        w1.append([])
        for j in range(784):
            w1[i].append(SecretInteger(Input(name="w1_" + str(i) + "_" + str(j), party=weight_party)) - Integer(20000))
    
    b1 = []
    for i in range(10):
        b1.append(SecretInteger(Input(name="b1_" + str(i), party=weight_party)))

    x = []
    for i in range(784):
        x.append(SecretInteger(Input(name="x_" + str(i), party=input_party)) - Integer(1))
    
    y = matmul(w1, x)
    y = add(y, b1)
    # y = relu(y)
    # y = matmul(w2, y)
    # y = add(y, b2)
    y = argmax(y)

    outputs: list[Output] = [
        Output(y, "label", input_party)
    ]

    return outputs
    
