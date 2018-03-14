var bjs = require('bitcoinjs-lib')
var b58 = require('bs58check')
var fs = require('fs')

// this function takes ypub and turns into xpub
function ypubToXpub(ypub) {
  var data = b58.decode(ypub)
  data = data.slice(4)
  data = Buffer.concat([Buffer.from('0488b21e','hex'), data])
  return b58.encode(data)
}

// this function takes an HDNode, and turns the pubkey of that node into a Segwit P2SH address
function nodeToP2shSegwitAddress(hdNode) {
  var pubkeyBuf = hdNode.keyPair.getPublicKeyBuffer()
  var hash = bjs.crypto.hash160(pubkeyBuf)
  var redeemScript = bjs.script.witnessPubKeyHash.output.encode(hash)
  var hash2 = bjs.crypto.hash160(redeemScript)
  var scriptPubkey = bjs.script.scriptHash.output.encode(hash2)
  return bjs.address.fromOutputScript(scriptPubkey)
}

var xpub = ypubToXpub("ypub6XfXmfz39nUvAYnhKXtERhgoGfG2fiv2m5kFFG8F2BPbieUY2C2HBeaTCtetBdDumCq1rVnjuqhtZBpELmGw6YvSfbdcc4gXLnNzpKVakjK");

var hdNode = bjs.HDNode.fromBase58(xpub);

var logger = fs.createWriteStream(process.argv[3], {
  flags: 'a' // 'a' means appending (old data will be preserved)
})

for(var i=0; i<parseInt(process.argv[2]); i++) {
  // generate as usual, but instead of getAddress, feed into above function
  var address = nodeToP2shSegwitAddress(hdNode.derive(0).derive(i))

  //var address = HDNode.derive(0).getAddress();

  console.log(address + ' ' + i.toString());
  logger.write(address + '\n');
}
