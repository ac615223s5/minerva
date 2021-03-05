
function stringReverser(){
	document.getElementById("string-reverser-out").value=document.getElementById("string-reverser-in").value.split('').reverse().join('');
}
function caesarCipher(){
	var s=document.getElementById("caesar-cipher-in").value,shift=parseInt(document.getElementById("caesar-cipher-shift").value),cipher="";
	if(!isNaN(shift)) for(var i=0;i<s.length;i++){
		var c=s.charCodeAt(i);
		if(65<=c&&c<=90) c=(c-65+shift)%26+65;
		else if(97<=c&&c<=122) c=(c-97+shift)%26+97;
		cipher=cipher.concat(String.fromCharCode(c));
	}
	document.getElementById("caesar-cipher-out").value=cipher;
}
function factorize(){
	var xstring = document.getElementById("factorize-in").value;
	if(xstring == "") return;
    if(isNaN(xstring)){
        alert("Must be a positive integer");
        return;
    }
    let X = parseInt(xstring);
    if(X <= 0){
        alert("Must be a positive integer");
        return;
    }

    function gcd(a, b){
        return b == 0 ? a : gcd(b, a%b)
    }

    function fpow(base, pow, mod){
        x = 1
        for(; pow; pow >>= 1){
            if(pow&1){
                x = x*base%mod
            }
            base = base*base%mod
        }
        return x
    }

    function mulmod(a, b, mod){
        return a*b%mod
    }

    function divmod(a, b, mod){
        return a*fpow(b, mod-2, mod)%mod;
    }

    function rand(l, r) {
        return Math.floor(Math.random()*(r-l+1)) + l;
    }

    function millerRabin(N, iterations = 7){
        if(N < 2 || N%6%4 != 1)
            return (N|1) == 3
        
        let A = [2, 325, 9375, 28178, 450775, 9780504, 1795265022]
        while(A.length < iterations)
            A.push(rand(1795265023, 9223372036854775807))
        
        let s = 0
        while(!(((N-1)>>s)&1))
            s++
        let d = N>>s;
        for(a in A){
            let p = fpow(a%N, d, N);
            let i = s;
            while(p != 1 && p != N-1 && a%N && i--)
                p = p*p%N
            if(p != N-1 && i != s)
                return 0
        }
        return true
    }

    function pollardsRho(N, iterations = 40){
        if(N == 1) return 1
        function f(x){
            return mulmod(x, x, N) + 1
        }
        let x = 0, y = 0, p = 2, q;
        let t = 0, i = 1;
        while(t++ % iterations || gcd(p, N) == 1){
            if(x == y)
                y = f(x = ++i)
            q = mulmod(p, Math.max(x, y) - Math.min(x, y), N)
            if(q)
                p = q
            x = f(x)
            y = f(f(y))
        }
        return gcd(p, N)
    }

    function Queue() {
        this.queue = [];
        this.tail = 0;
        this.head = 0;
    }

    Queue.prototype.push = function(element) {
        this.queue[this.tail++] = element
    }

    Queue.prototype.pop = function(){
        if(this.tail === this.head)
            return undefined
        let element = this.queue[this.head]
        delete this.queue[this.head++]
        return element
    }

    Queue.prototype.back = function(){
        if(this.tail === this.head)
            return undefined
        return this.queue[this.tail-1]
    }

    function pollardsRhoPrimeFactor(x, pollardsRhoIters = 40, millerRabinIters = 7){
        if(x == 1) return {}
        let ret = []
        let q = new Queue()
        q.push(x);
        while(q.head !== q.tail){
            let y = q.pop()
            if(millerRabin(y, millerRabinIters))
                ret.push(y)
            else{
                q.push(pollardsRho(y, pollardsRhoIters))
                q.push(y/q.back())
            }
        }
        ret.sort()
        return ret
    }

    let primes = pollardsRhoPrimeFactor(X)
    prime = primes.sort((a, b) => {return a-b})

    function getProduct(total, num) {
        return total*num;
    }
    
    const getSubsets = a => a.reduce((ret, value) =>
        ret.concat(ret.map(set => [value,...set])), [[]]
    )

    function unique(a) {
        return a.sort((a, b) => {return a-b} ).filter(function(value, index, array) {
            return (index === 0) || (value !== array[index-1])
        })
    }

    let factors = getSubsets(primes)
    factors.push([1])
    for(let i = 0; i < factors.length; i++)
        factors[i] = factors[i].reduce(getProduct, 1)
    factors = unique(factors)

	let sum = 0, uniqueCnt = 0, str = "";
	for(let i = 0; i <= primes.length; i++){
		if((i == primes.length) || (i && primes[i] != primes[i-1])){
			str = str.concat(primes[i-1]+"<sup>"+sum+"</sup> * ");
			sum = 0
			uniqueCnt++
		}
		sum++
	}
	if(str.length)
		str = str.slice(0, -3)
	
	document.getElementById("factorize-out1").innerHTML=primes.length;
	document.getElementById("factorize-out2").innerHTML=primes.join(", ");
	document.getElementById("factorize-out3").innerHTML=uniqueCnt;
	document.getElementById("factorize-out4").innerHTML=str;
	document.getElementById("factorize-out5").innerHTML=factors.length;
	document.getElementById("factorize-out6").innerHTML=factors.join(", ");
}