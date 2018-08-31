window.addEventListener('load', function() {

	B.debug = true;
	B.fadeDur = B.debug ? 100 : 500;
	B.noMorePaths = false;
	B.noTouching = false;
	B.chainCount = 0;
	B.nodelimitArray = [+B.data.nodelimit];
	B.currentChain = 0;
	B.qstrings = [];
	B.qstrings.push(B.data.queryString);
	
	B.loader = document.getElementById('new-path-loader');
	B.fade(B.loader, 'out', true);

	const reportDiv = document.getElementById('report');
	const reportMsg = document.getElementById('report-msg');
	const reportTxt = document.getElementById('report-txt');
	const reportBtn = document.getElementById('report-btn');

	B.report = function(msg, ok, callback, dismissBack) {
		B.fade(reportDiv, 'in', false);
		reportMsg.scrollTop = 0;
		reportTxt.innerHTML = msg;
		if (ok) {
			reportBtn.style.display = 'block';
			reportBtn.textContent = ok;
			reportBtn.addEventListener('click', callback);
		} else {
			reportBtn.style.display = 'none';
		}
		function dismissReport() {
			B.fade(reportDiv, 'out', true);
			document.body.style.overflow = 'auto';	
			if (dismissBack)
				dismissback();
			reportDiv.removeEventListener('click', dismissReport);
		}
		reportDiv.addEventListener('click', dismissReport);
	}

	if (B.data.error) 
		B.report(B.data.error);

	// ** animate nodes on load ** //
	const nodes = document.getElementsByClassName('node');
	for (let i = 0; i < nodes.length; i++) {
		setTimeout(() => {
			nodes[i].classList.add('fade-in');
		}, i * B.fadeDur)
	}

	const homeBtn = document.getElementById('home');
	homeBtn.addEventListener('click', function() {
		B.report(
			"Heads up — going home will clear your current paths.",
			"Go Home",
			() => { location.href = "/"; }
		);
	});

	// ** share stuff **
	const shareBtn = document.getElementById('share');
	const shareMenu = document.getElementById('share-menu');
	const shareItems = document.getElementsByClassName('share-item');

	shareBtn.addEventListener('click', function() {
		B.fade(shareMenu, 'in', false);
	});
	shareMenu.addEventListener('click', function() {
		B.fade(shareMenu, 'out', true);
	});

	for (let i = 0; i < shareItems.length; i++) {
		shareItems[i].addEventListener('click', function() {
			const id = this.id;
			const title = "SynoMapp: " + B.data.start + " ... " + B.data.end;
			const link = location.href.split("?")[0] + "?s=" + B.data.start + "&e=" + B.data.end + "&nl=" + B.qstrings[B.chainCount].split(B.data.start)[1].split(B.data.end)[0] + "&sl=" + B.qstrings[B.chainCount].split(B.data.start)[1].split(B.data.end)[1];
			const url = encodeURIComponent(link);
			switch(this.id) {
				case 'email':
					window.open("mailto:?body=" + title + " -- " + url + "&subject= + b", "_blank")
					break;
				case "tw":
					window.open("https://twitter.com/intent/tweet?text=" + title + " " + url, "_blank");
					break;
				case "fb":
					window.open("http://www.facebook.com/sharer.php?u=" + title + " " + url, "_blank");
				break;
			}
		});
	}
});