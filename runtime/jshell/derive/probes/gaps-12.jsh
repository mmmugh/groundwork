# G21: how /reset and /reload read their options: prefixes, letter clusters, "-" and "--", and the order of errors
/reload -qu

/reload -res

/reload -r

/reload --quiet

/reload --q

/reload --restore

/reload -quietx

/reload -rq

/reload -Q

/reload -quiet -quiet

/reload -quiet extra more

/reload extra -quiet

/reset --bogus

/reset -quiet

/reset -x

/reload -restore -q -

/reset -

/reset - -

/reload --

/reload ---x

/reload extra -bogus

/reload -bogus extra

/reload -add

/reload -quiet -- -bogus

/reload foo

/reload -quiet foo

/reload -restore -bogus

/reload -

