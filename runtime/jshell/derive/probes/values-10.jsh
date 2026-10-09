# first value
100

# a declaration shifts ids
int a = 1

# printed name after a declaration
200

# use the printed name
$3 + 1

# use the API-style name
$2 + 1

# next
300

# use $5
$5 * 2

# use $4 
$4 * 2

# list vars
/vars

# a method then an expression
void m() {}

# printed name after method
400

# vars again
/vars

# redeclare variable a and see numbering
int a = 2

# expression after redeclare
500

# forward reference to a later $ name
$99

# a failed declaration then expression
int broken = ;

# expression after syntax error
600

# $ name assigned type
$3 = "string"

# ids list
/list

# drop by $ name
/drop $3

# vars after drop
/vars

# expression after drop
700
