# term-filter-test

A simple proof of concept of a `TermFilter` interface for RDF/JS quad matching methods.

The current definitions of the quad matching methods in the RDF/JS specs allow only `null` for any value and `Term` objects for a equals comparison.
The concept of the `TermFilter` interface offers more flexibility.
Every `TermFilter` must have a `test` method that returns a `boolean` whether the given `Term` fulfills the filter criteria or not.
Some `DatasetCore` or `Store` implementations may support accelerated execution of specific filters.
The code for accelerated filter execution can identify the type of the filter with the `type` property.
Arguments for the filter are stored in the `args` property.
Interfaces with quad matching methods have to add two addition methods for each quad matching method.
One method to run the actual quad matching.
The name could be simply extended by `Filter`, so `match` becomes `matchFilter`.
Query engines may rely on knowing whether a filter is executed accelerated or not.
The second method can be used to check if the given filters would run accelerated.
The name could be simply extended by `isAccelerated`, so `matchFilter` becomes `isAcceleratedMatchFilter`.

The concept would cover the use case of indexed `DatasetCore` or `Store` interfaces by giving access to the filter type and arguments.
Query engines require to know whether a filter is executed accelerated or not.
Also, this use case is covered by the `isAccelerated` method.
Simpler use cases without query engines are also possible because with the `test` method it's always possible to use a filter even if the type is unknown.

Besides the `TermFilter` interface, a set of filters should be included in the specification. 
The `filters.js` file contains a set of filters that may be good candidates to guaranteed interoperability for accelerated execution. 

## Alternative Options

It would be possible to add only a `isAcceleratedMatch` method and use the existing quad matching methods.
Support for `TermFilter` can be detected by checking the type of `isAcceleratedMatch`.

## Example Code

This repository contains two simple dataset methods with additional `matchFilter` and `isAcceleratedMatchFilter` methods.

The `TimeSeriesDataset` contains an index for a `xsd:dateTime` literal for a specific property.
Filters with the type `AND`, `GT` and `LTE` will run accelerated.
The example file contains different match patterns and some descriptions.
Type the following command to run the example:

```
node example-TimeSeriesDataset.js
```

The `TextSearchDataset` contains a text index for literals for a specific property.
A custom filter with the type `CUSTOM_TEXT_SEARCH` is used to identify filters that can be run accelerated. 
The example file contains different match patterns and some descriptions.
Type the following command to run the example:

```
node example-TextSearchDataset.js
```
