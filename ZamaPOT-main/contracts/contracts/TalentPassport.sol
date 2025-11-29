// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TalentPassport is ERC721, Ownable {
    uint256 private _nextTokenId;
    
    struct TalentRecord {
        string skillType;
        bytes32 encryptedScore;
        uint256 timestamp;
        bool verified;
        uint8 level;
    }
    
    mapping(uint256 => TalentRecord) public talentRecords;
    mapping(address => uint256[]) public userBadges;
    
    event BadgeMinted(
        address indexed user,
        uint256 tokenId,
        string skillType,
        uint8 level,
        uint256 timestamp
    );
    
    event ScoreVerified(
        uint256 tokenId,
        bytes32 encryptedScore,
        bool passed
    );

    constructor() ERC721("TalentPassport", "TPP") Ownable(msg.sender) {}

    function mintTalentBadge(
        string memory _skillType,
        bytes32 _encryptedScore,
        bool _passed,
        uint8 _level
    ) external returns (uint256) {
        require(_passed, "Assessment not passed");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        
        talentRecords[tokenId] = TalentRecord({
            skillType: _skillType,
            encryptedScore: _encryptedScore,
            timestamp: block.timestamp,
            verified: true,
            level: _level
        });
        
        userBadges[msg.sender].push(tokenId);
        
        emit BadgeMinted(
            msg.sender,
            tokenId,
            _skillType,
            _level,
            block.timestamp
        );
        
        emit ScoreVerified(tokenId, _encryptedScore, _passed);
        
        return tokenId;
    }

    function getUserBadges(address _user) external view returns (uint256[] memory) {
        return userBadges[_user];
    }

    function getTalentRecord(uint256 _tokenId) external view returns (
        string memory skillType,
        bytes32 encryptedScore,
        uint256 timestamp,
        bool verified,
        uint8 level
    ) {
        TalentRecord memory record = talentRecords[_tokenId];
        return (
            record.skillType,
            record.encryptedScore,
            record.timestamp,
            record.verified,
            record.level
        );
    }

    function verifyScore(uint256 _tokenId, bytes32 _expectedScore) external view returns (bool) {
        return talentRecords[_tokenId].encryptedScore == _expectedScore;
    }
}
