# The scratchpad's startup (decision J1): ten imports of --startup DEFAULT_NO_MODULE_IMPORTS, then java.time.
#! startup
/list -start

#! startup
/imports

LocalDate.of(2026, 1, 1)

Duration.ofHours(2)

new ArrayList<String>(List.of("a"))

#! startup
DecimalFormat df = new DecimalFormat("0.00")

java.text.DecimalFormat df2 = new java.text.DecimalFormat("0.00")

#! startup
df2.format(3.14159)

#! startup
Instant.EPOCH.atZone(ZoneOffset.UTC).getYear()

import module java.base;

DecimalFormat df3 = new DecimalFormat("#")

#! startup
/imports

int z = 1

#! startup
/list -all

#! startup
/drop s1

#! startup
/imports

# Decision J3: the scratchpad runs in en_US, as a US reader's JDK does (Ristretto's VM alone has "en" and no country).
#! startup
java.util.Locale.getDefault()

#! startup
java.text.NumberFormat.getCurrencyInstance().format(1234.5)
