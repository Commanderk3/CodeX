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

Make the styles bg color of page and card contrast look like : [behance](https://www.behance.net/gallery/179685261/Code-Battle-UIUX)
Post Match Results
Emit player activity

We are not storing whenever `activeRooms` updates as it would be lots of read/write opperation per minute. Instead we are saving when:
- match is found. Saving status as 'live'. So that user can re-connect if they disconnect.
- when user disconnects, save their progress (testCase passed).

When user rejoins and its username and roomId exists in activeRooms, it will emit back the current state of the game that the user missed. This includes time, opp-progress, player last progress. 

Display error message in testcasewindow