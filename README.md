Generates GraphViz graphs from dotnet core solutions.

It's not meant to be a ready-made solution, just a quick scribble which solves my problem 😉

## Dependencies

```bash
brew install graphviz
```

## Syntax

```bash
# Install nodejs dependencies
yarn

# Execute
./generate.sh ../../path/to/your.sln [netcoreapp3.1 | net6.0]

# Results are in ./out
