# rssfeed

Proxy code for taking public events from the [elvanto](elvanto.com) and presenting them as an RSS feed.

This is most useful because it can then be connected to a [mailchimp](mailchimp.com) email template to generate mailouts containing events.
More info on how to connect a mailchimp template to a rss feed is [here](https://templates.mailchimp.com/getting-started/merge-tags/rss-merge-tags/)


##### Required dependencies

The following dependencies are required to be installed locally (and hence deployed with the lambda code)

```text
npm install xmlbuilder
npm install axios
```

The following dependencies are installed globally so they are not deployed with the lambda, either because they are already present on aws (aws-sdk), or that they are to support test cases (mocha)

```text
npm install -g aws-sdk
npm install -g mocha

```

##### The deployment model

* deploy this code as an AWS lambda function
* create an AWS API gateway pointing to the lambda
* create a mailchimp template with rss feed tags pointing to the AWS API gateway

