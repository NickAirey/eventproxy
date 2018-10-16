##### Required dependencies

The following dependencies are required to be installed locally (and hence deployed with the lambda code)

```text
npm install axios
```

The following dependencies are installed globally so they are not deployed with the lambda, either because they are already present on aws (aws-sdk), or that they are to support test cases (mocha)

```text
npm install -g aws-sdk
npm install -g mocha

```