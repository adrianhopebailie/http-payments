---
coding: utf-8

title: HTTP-Payments
docname: draft-hope-bailie-http-payments-01
category: std

pi: [toc, sortrefs, symrefs, comments]
smart_quotes: off

area: dispatch
author:

  -
    ins: A. Hope-Bailie
    name: Adrian Hope-Bailie
    org: Ripple
    street: 315 Montgomery Street
    city: San Francisco
    region: CA
    code: 94104
    country: US
    phone: -----------------
    email: adrian@ripple.com
    uri: https://www.ripple.com

normative:
    RFC4648:
    RFC7231:
    W3C.CR-payment-request-20170921:
    W3C.CR-payment-method-id-20170914:

informative:
    HTTP-ILP:
        title: "HTTP-ILP"
        target: https://github.com/interledger/rfcs/blob/master/0014-http-ilp/0014-http-ilp.md
        author:
            organization: Interledger Community Group
        date: 2017-10

--- note_Feedback

This specification is an early experiment in bringing the work of the W3C Web Payments working group to the HTTP protocol. It is maintained at [https://github.com/adrianhopebailie/http-payments](https://github.com/adrianhopebailie/http-payments). 

The work is inspired by work in the Interledger community on [HTTP-ILP](#HTTP-ILP)

--- abstract

HTTP-Payments describes a mechanism for passing a standardized payment request in the headers of an HTTP 402 response and the expected behaviour of HTTP clients that receive such a response.

--- middle

# Introduction

The W3C Web Payments working group has defined a Web Platform API that is being widely deployed to browsers for requesting a payment. The [PaymentRequest API](#W3C.CR-payment-request-20170921), defines an interface for a website to pass a payment request to the user agent via this API.

The user agent will then, through interaction with the user, complete or reject the requested payment.

HTTP-Payments describes a manner in which an HTTP server can request payment from a client in the same manner as a website would from a user agent using the W3C APIs.

The critical portion of the payment request is the set of, one or more, supported payment methods and associated payment-method-specific data. HTTP-Payments defines a mechaism by which these are expressed in the response headers of an HTTP request for which the server requires a payment.

In the website and user-agent scenario, when handling the payment request, the user-agent will prompt the user to pick one of the supported payment methods and will then handle the payment in a manner that is appropriate for that payment method. In an HTTP-Payment, the HTTP client will perform this function, likely with no user interaction.

# Terminology

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC2119][].

# Payment Methods

A payment method is a way that the payee can be paid. Examples include, via credit card, bank wire transfer, or Bitcoin. 

A payment method is identified by a payment method identifier as specified in the [Payment Method Identifiers specification](#W3C.CR-payment-method-id-20170914). This is either a standardized short-string, identified in a registry maintained by the W3C Web Payments WG, or a URL.

The most common case will be for the URL form to be used. In cases where there is no authority responsible for the payment method that can host the payment method URL, the WG will consider adding a new identifier for the payment method to the registry.

Payment methods define the data that the payer and payee need to exchange, to complete a payment, and the process by which this occurs.

# HTTP Status Code 402

The HTTP Status Code, 402 (Payment Required) is currently defined in [RFC7231](#RFC7231) as "reserved for future use". Using HTTP-Payment a service MAY respond to any request with the 402 response code and use the "Pay" header to specify the payment request details.

## The "Pay" Header

The body of the "Pay" header is defined as follows:

    Pay = 1#( payment-method-identifier RWS payment-amount RWS payment-address RWS payment-method-data )

    payment-method-identifier = token
    payment-amount = 1*DIGIT
    payment-address = token
    payment-method-data -token

    ;token is defined in [RFC7231](#RFC7231)

The Pay field-value consists of a comma-separated list of payment requests for payment using different payment methods accepted by the sender.

The fields in the header are:

- payment-method-identifier:
The payment method identifier for the accepted payment method. Either a standardized short-string or a URL.

- payment-amount:
The amount that must be paid, expressed as an integer. The currency, scale and precision of the destination account are expected to be expressed in the account address or interprted from the payment mthod data.

- payment-address:
A payment-method specific payee address. For example, if the payment method is Bitcoin this would be a Bitcoin address.

- payment-method-data:
Payment method specific data. This is either a URI identifying the data or, if it is small enough, is the data itself, BASE64URL encoded as described in [RFC4648](#RFC4648), Section 5.

## The "Pay-Token" Header

An HTTP client that makes a paid-HTTP request, after paying for the request to be processed, MAY attach a "Pay-Token" header with a token referencing the payment.

This mechanism can be employed by services wishing to accept payments without binding these to an HTTP session.

    Pay-Token = token

## The "Pay-Balance" Header

Ann HTTP Service that accepts payments may respond to any request with a "Pay-Balance" header. This contains an integer indicating the current balance of paid credit the client has with the HTTP service.

    Pay-Balance = 1*DIGIT

## Flow

Upon receipt of a 402 response, an HTTP client MUST look for any "Pay" headers and parse these. The client can discard all headers for which it is not equipped to make a payment (i.e. filter on payment-method-identifier)

The client MUST then select the header that is preferred for processing based upon external interactions (such as with a human user) or pre-configured rules. The client MUST attempt to make a payment using the payment method identified in the header, for the amount specified, and to the destination address specified.

The payment-method specific data SHOULD be sufficient for the system processing the payment to reconcile the payment with the original HTTP request.

The client SHOULD receive a token in return for completeing the payment. If the payment method used does return a token to the payer, it MUST pass this token in subsequent HTTP requests.

The token MUST be passed in the "Pay-Token" header, BASE64URL encoded as described in [RFC4648](#RFC4648), Section 5.

The HTTP service MUST process the "Pay-Token" header and use this to reconcile this HTTP request with the payment received prior.

## Example

Client requests access to a paid resource:

    POST /upload HTTP/1.1
    Host: myservice.example

Server responds with payment request (and optionally indicates that the client has a zero balance):

    HTTP/1.1 402 Payment Required
    Pay: http://interledger.org 10 us.nexus.ankita.~recv.filepay SkTcFTZCBKgP6A6QOUVcwWCCgYIP4rJPHlIzreavHdU
    Pay-Balance: 0

Client makes the payment through an appropriate payment side-channel and then attempts the request again:

    POST /upload HTTP/1.1
    Host: myservice.example
    Pay-Token: 7y0SfeN7lCuq0GFF5UsMYZofIjJ7LrvPvsePVWSv450

Server responds:

    HTTP/1.1 200 Success
    Pay-Balance: 0  

--- back

# Security Considerations

Payment information MUST not be exchanged on a connection that is not secured end-to-end. Servers that receive any HTTP payment header over an insecure connection should reject the request. Clients that receive any HTTP Payment headers over an insecure connection MUST ignore the headers.

# IANA Considerations

## Header Field Registration

   HTTP header fields are registered within the "Message Headers"
   registry maintained at
   <http://www.iana.org/assignments/message-headers/>.

   This document defines the following new HTTP header fields.

   | Header Field Name | Protocol | Status   | Reference     |
   |-------------------|----------|----------|---------------|
   | Pay               | http     | ?        | This Document |
   | Pay-Token         | http     | ?        | This Document |
   | Pay-Balance       | http     | ?        | This Document |

   The change controller is: "IETF (iesg@ietf.org) - Internet
   Engineering Task Force".

## Payment Method Identifier Short-string Registry

The W3C maintains a registry of standardized short-string payment method identifiers as part of the [Payment Method Identifier](#W3C.CR-payment-method-id-20170914) specification. If standardized short-string identifiers are to be used for HTTP-Payments this may be better served as an IANA registry.