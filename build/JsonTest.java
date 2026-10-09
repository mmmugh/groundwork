/*
 *  Copyright 2026 Groundwork contributors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
import java.util.*;

final class JsonTest {
  static void testParsesEveryValueKindAndKeepsKeyOrder() throws Exception {
    Object v = Json.parse("{\"b\": [1, -2.5e1, true, false, null], \"a\": \"x\\ny\\u00e9\\\"\"}");
    var m = (Map<?, ?>) v;
    T.eq(List.of("b", "a"), new ArrayList<>(m.keySet()), "key order kept");
    T.eq(Arrays.asList(1L, -25.0, true, false, null), m.get("b"), "array values and number types");
    T.eq("x\nyé\"", m.get("a"), "string escapes");
  }
  static void testRejectsBrokenJsonWithAPosition() {
    T.fails("line 2, column 8", () -> Json.parse("{\"a\": 1,\n  \"b\": }"), "missing value");
    T.fails("duplicate key", () -> Json.parse("{\"a\": 1, \"a\": 2}"), "duplicate key");
    T.fails("after the value", () -> Json.parse("{} x"), "trailing text");
    T.fails("unterminated string", () -> Json.parse("\"abc"), "open string");
  }
  static void testWriteThenParseIsTheSameValue() throws Exception {
    var m = new LinkedHashMap<String, Object>();
    m.put("text", "tab\tquote\" é 😀 <&>");
    m.put("list", List.of(1L, 2.5, true));
    m.put("none", null);
    T.eq(m, Json.parse(Json.write(m)), "round trip");
  }
}
