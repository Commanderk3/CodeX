Notes

Basic Code Editor is done. 
Now I can either start working on the match making/ websocket part or I can start working on sending the code to jude0

**Test Code**
```javascript
function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) return mid;

    // Left half is sorted
    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } 
    // Right half is sorted
    else {
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }

  return -1;
}
```
Todo:


after refresh in codearena, it should fall
matchHistory needs to be reversed. Also fix ndant live status matches


- add a search bar to search rooms

**USE PROPER NAMING CONVENTION: handler**

- show live animation in match history tab if a match is ongoing
- dont forget to send less test cases to client. Ig we have to add a total test case field.

- rematch feature 

- front end optimizations

- navigation fix

- isLive fix in Match list