// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

// Reverted to original structure based on kshitijofficial/Dgdrive3.0 logic
contract Upload {

  struct Access{
     address user;
     bool access; //true or false
  }

  struct AccessHistory {
    address fileOwner;
    string fileUrl;
    address grantedTo;
    uint256 timestamp;
  }

  // Store only URLs, mapping user address to string array
  mapping(address=>string[]) value;
  mapping(address=>mapping(address=>bool)) ownership;
  mapping(address=>Access[]) accessList;
  mapping(address=>mapping(address=>bool)) previousData;
  mapping(address=>AccessHistory[]) accessHistory;

  // Original events (or remove if not present in original)
  event FileAdded(address indexed user, string url);
  event AccessGranted(address indexed owner, address indexed user);
  event AccessRevoked(address indexed owner, address indexed user);

  // Original add function with 2 arguments
  function add(address _user, string memory url) external {
      value[_user].push(url);
      emit FileAdded(_user, url); // Emit original event
  }

  // Allow function (assuming this part is consistent with original)
  function allow(address user) external {
      require(user != address(0), "Invalid address");
      // Original might not have prevented self-allow, adjust if needed based on repo
      // require(user != msg.sender, "Cannot grant access to yourself"); 
      
      ownership[msg.sender][user] = true;

      if(previousData[msg.sender][user]){
         for(uint i = 0; i < accessList[msg.sender].length; i++) {
             if(accessList[msg.sender][i].user == user) {
                  accessList[msg.sender][i].access = true; 
             }
         }
      }else{
          accessList[msg.sender].push(Access(user, true));  
          previousData[msg.sender][user] = true;  
      }

      // Record access history for all files
      for(uint i = 0; i < value[msg.sender].length; i++) {
          accessHistory[msg.sender].push(AccessHistory({
              fileOwner: msg.sender,
              fileUrl: value[msg.sender][i],
              grantedTo: user,
              timestamp: block.timestamp
          }));
      }

      emit AccessGranted(msg.sender, user);
  }

  // Disallow function (assuming consistent)
  function disallow(address user) public {
      require(user != address(0), "Invalid address");
      ownership[msg.sender][user] = false;
      for(uint i = 0; i < accessList[msg.sender].length; i++) {
          if(accessList[msg.sender][i].user == user) {
              accessList[msg.sender][i].access = false;
              break;
          }
      }
      emit AccessRevoked(msg.sender, user);
  }

  // Original display function returning string array
  function display(address _user) external view returns(string[] memory) {
      require(
          _user == msg.sender || ownership[_user][msg.sender],
          "You don\'t have access to view these files"
      );
      // Original didn't need empty array check if require passed
      return value[_user]; 
  }

  // shareAccess function (assuming consistent)
  function shareAccess() public view returns(Access[] memory) {
      return accessList[msg.sender];
  }

  // New function to get access history
  function getAccessHistory() public view returns(AccessHistory[] memory) {
      return accessHistory[msg.sender];
  }

  // Removed helper functions not present in original or relying on FileInfo
  // function hasAccess(...)
  // function getFileCount(...)
  // function isAccessGranted(...)
}