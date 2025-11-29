// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract EnhancedTalentPassport is ERC721, Ownable {
    using Strings for uint256;
    
    uint256 private _nextTokenId;
    uint256 public constant MINT_FEE = 0.001 ether;
    
    struct TalentRecord {
        string skillType;
        bytes32 encryptedScore;
        uint256 timestamp;
        bool verified;
        uint8 level;
        string certificateId;
        address verifiedBy;
        uint8 cheatingLikelihood; // 0-100 scale
        bool behaviorFlagged;
        uint256 totalQuestions;
        uint256 correctAnswers;
    }
    
    mapping(uint256 => TalentRecord) public talentRecords;
    mapping(address => uint256[]) public userBadges;
    mapping(bytes32 => bool) public usedScores;
    
    event BadgeMinted(
        address indexed user,
        uint256 tokenId,
        string skillType,
        uint8 level,
        string certificateId,
        uint8 cheatingLikelihood,
        bool behaviorFlagged,
        uint256 timestamp
    );
    
    constructor() ERC721("TalentPassport", "TPP") Ownable(msg.sender) {}

    function mintTalentBadge(
        string memory _skillType,
        bytes32 _encryptedScore,
        uint8 _level,
        string memory _certificateId,
        uint8 _cheatingLikelihood,
        bool _behaviorFlagged,
        uint256 _totalQuestions,
        uint256 _correctAnswers
    ) external payable returns (uint256) {
        require(msg.value >= MINT_FEE, "Insufficient minting fee");
        require(!usedScores[_encryptedScore], "Score already used");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        
        talentRecords[tokenId] = TalentRecord({
            skillType: _skillType,
            encryptedScore: _encryptedScore,
            timestamp: block.timestamp,
            verified: true,
            level: _level,
            certificateId: _certificateId,
            verifiedBy: address(this),
            cheatingLikelihood: _cheatingLikelihood,
            behaviorFlagged: _behaviorFlagged,
            totalQuestions: _totalQuestions,
            correctAnswers: _correctAnswers
        });
        
        usedScores[_encryptedScore] = true;
        userBadges[msg.sender].push(tokenId);
        
        emit BadgeMinted(
            msg.sender,
            tokenId,
            _skillType,
            _level,
            _certificateId,
            _cheatingLikelihood,
            _behaviorFlagged,
            block.timestamp
        );
        
        return tokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        TalentRecord memory record = talentRecords[tokenId];
        
        string memory levelName = _getLevelName(record.level);
        string memory backgroundColor = _getLevelColor(record.level);
        string memory status = record.behaviorFlagged ? "Flagged" : "Verified";
        string memory statusColor = record.behaviorFlagged ? "#FF6B6B" : "#4CAF50";
        
        string memory imageSVG = _generateSVG(record.skillType, levelName, backgroundColor, status, statusColor, record.cheatingLikelihood);
        string memory imageURI = string(abi.encodePacked("data:image/svg+xml;base64,", Base64.encode(bytes(imageSVG))));
        
        string memory json = Base64.encode(
            bytes(string(
                abi.encodePacked(
                    '{"name": "Talent Passport #', tokenId.toString(), '",',
                    '"description": "Private Proof of Talent - On-chain skill verification with behavior analysis",',
                    '"image": "', imageURI, '",',
                    '"attributes": [',
                    '{"trait_type": "Skill Type", "value": "', record.skillType, '"},',
                    '{"trait_type": "Level", "value": "', levelName, '"},',
                    '{"trait_type": "Certificate ID", "value": "', record.certificateId, '"},',
                    '{"trait_type": "Verification Status", "value": "', status, '"},',
                    '{"trait_type": "Cheating Likelihood", "value": ', uint256(record.cheatingLikelihood).toString(), '},',
                    '{"trait_type": "Score", "value": "', record.correctAnswers.toString(), '/', record.totalQuestions.toString(), '"},',
                    '{"trait_type": "Behavior Analysis", "value": "', record.behaviorFlagged ? "Flagged" : "Clean", '"},',
                    '{"trait_type": "Verification Date", "display_type": "date", "value": ', record.timestamp.toString(), '}',
                    ']}'
                )
            ))
        );
        
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function _generateSVG(
        string memory skillType, 
        string memory levelName,
        string memory backgroundColor,
        string memory status,
        string memory statusColor,
        uint8 cheatingLikelihood
    ) internal pure returns (string memory) {
        string memory cheatingText = cheatingLikelihood == 0 ? "No Cheating Detected" : string(abi.encodePacked("CLS: ", _uint2str(cheatingLikelihood), "%"));
        
        return string(
            abi.encodePacked(
                '<svg width="400" height="350" xmlns="http://www.w3.org/2000/svg">',
                '<rect width="400" height="350" fill="', backgroundColor, '"/>',
                '<rect x="20" y="20" width="360" height="310" fill="white" rx="10"/>',
                
                '<text x="200" y="60" text-anchor="middle" font-family="Arial" font-size="24" fill="#333">Talent Passport</text>',
                '<text x="200" y="90" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">', skillType, '</text>',
                
                '<text x="200" y="130" text-anchor="middle" font-family="Arial" font-size="14" fill="#888">Level: ', levelName, '</text>',
                '<text x="200" y="155" text-anchor="middle" font-family="Arial" font-size="12" fill="', statusColor, '">Status: ', status, '</text>',
                '<text x="200" y="180" text-anchor="middle" font-family="Arial" font-size="11" fill="#999">', cheatingText, '</text>',
                
                '<text x="200" y="220" text-anchor="middle" font-family="Arial" font-size="10" fill="#aaa">Private Proof of Talent</text>',
                '<text x="200" y="240" text-anchor="middle" font-family="Arial" font-size="9" fill="#bbb">FHE + Behavior Analysis</text>',
                
                // Cheating likelihood indicator
                '<rect x="100" y="260" width="200" height="8" fill="#f0f0f0" rx="4"/>',
                '<rect x="100" y="260" width="', _uint2str(uint256(cheatingLikelihood) * 2), '" height="8" fill="#FF6B35" rx="4"/>',
                '<text x="200" y="285" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">Cheating Likelihood Score</text>',
                
                '</svg>'
            )
        );
    }

    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function _getLevelName(uint8 level) internal pure returns (string memory) {
        if (level == 5) return "Expert";
        if (level == 4) return "Advanced";
        if (level == 3) return "Intermediate";
        if (level == 2) return "Beginner";
        return "Novice";
    }

    function _getLevelColor(uint8 level) internal pure returns (string memory) {
        if (level == 5) return "#4CAF50";
        if (level == 4) return "#8BC34A";
        if (level == 3) return "#FFC107";
        if (level == 2) return "#FF9800";
        return "#F44336";
    }

    function getUserBadges(address _user) external view returns (uint256[] memory) {
        return userBadges[_user];
    }

    function getTalentRecord(uint256 _tokenId) external view returns (
        string memory skillType,
        bytes32 encryptedScore,
        uint256 timestamp,
        bool verified,
        uint8 level,
        string memory certificateId,
        uint8 cheatingLikelihood,
        bool behaviorFlagged,
        uint256 totalQuestions,
        uint256 correctAnswers
    ) {
        TalentRecord memory record = talentRecords[_tokenId];
        return (
            record.skillType,
            record.encryptedScore,
            record.timestamp,
            record.verified,
            record.level,
            record.certificateId,
            record.cheatingLikelihood,
            record.behaviorFlagged,
            record.totalQuestions,
            record.correctAnswers
        );
    }

    function withdrawFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
