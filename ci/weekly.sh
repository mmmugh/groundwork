# Copyright 2026 Groundwork contributors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# weekly.sh: the whole suite, split for a runner (W-13). Each command runs whatever happened before it; the script exits 1
# and names every one that failed.
#   bash ci/weekly.sh node|chromium|webkit|firefox
source "$(dirname "$0")/lib.sh"
case "${1:-}" in
  node) weekly_node_steps ;;
  chromium|webkit|firefox) browser_steps "$1" ;;
  *) echo "usage: bash ci/weekly.sh node|chromium|webkit|firefox" >&2; exit 2 ;;
esac
finish
