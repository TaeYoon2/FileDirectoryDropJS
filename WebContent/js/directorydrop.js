var droppedFiles = [];  //dropped Files as blob
var tempPath = [];  // relative Paths of dropped files 
					// ; in web, for the purpose of security, dropped files and directories are sandboxed.
var totalItemNum = 0;  // the number of items(file or directory) which are dropped on the top of file trees
var countItemNum = 0;  // the counted number of fully searched file trees
						// I intended that reading (recursively) file trees would stop when all the file trees dropped fully searched.
						// i.e. (totalItemNum == countItemNum)

// drop Handler as written below
var dropHandler = function(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	var items = evt.dataTransfer.items;

	console.log(items);
	
	totalItemNum=items.length;
    var entry = items[0].webkitGetAsEntry();
    $.blockUI();
    	for(i=0; i <totalItemNum; i++){
    		readElement(items[i].webkitGetAsEntry(),true);
    	}
    	

};

document.addEventListener('drop',dropHandler);

document.addEventListener('dragover',function(evt){
	// drop 시 원치 않는 동작 방지
	// avoid operating unintendedly when dropping
	evt.stopPropagation();
	evt.preventDefault();
	
});


function printTable(data) {
    // 테이블 출력
    var present = document.getElementById("present"); // div
    // tag
    present.innerHTML = "";
    var table = document.createElement("table"); // new table for new wav 

    table.id = 'ptable'; // table id
    table.className = 'table'; // table className
    present.appendChild(table); // table --> present
    var thead = document.createElement("thead");
    var row = document.createElement("tr");
    row.innerHTML = "<th>" + "경로(fullPath)" + "</th>";
    thead.appendChild(row);
    table.appendChild(thead); // 테이블 컬럼이름 추가

    var filepaths = [];

    var tbody = document.createElement("tbody");
    table.appendChild(tbody);
    /********** file paths ************/
    for (i = 0; i < data.length; i++) {
        var rowi = document.createElement("tr"); // next
        // trs
        rowi.innerHTML = "<td class='path'>" + data[i] + "</td>";
        tbody.appendChild(rowi);

    }

}

//최초 드랍 시 가지 갯수
//각 가지에서 마지막 디렉토리 혹은 가지 첫번째가 파일일 때 출력
//가지가 다 세어지면 unblock
function finisher(isFull){
	if(isFull != undefined) {
           	               		
                   window.countItemNum++;
                   if(window.totalItemNum == window.countItemNum){
                  	 window.setTimeout(function(){
                         	window.countItemNum = 0; // drop count갯수 초기화
                         		printTable(tempPath);
                  		 $.unblockUI();
                  	 }, 50);
                  	 
                   }
				}
};

function readElement(elem,isFirst) {
	
	if(elem.isDirectory){
		var elemReader = elem.createReader();
		var isLastDir = true;  // 단일 함수 범위
		var dirRead = function() {
			elemReader.readEntries(function(subelems){
				if(!subelems.length) {  // 읽을게 없을 때(한번에 최대 100개)
					//끝
					finisher(isLastDir);
				} // 100개
				else {
					for(i=0;i<subelems.length ; i++){
						readElement(subelems[i]); // 하나씩 읽고 (재귀적으로 읽을 때, isFirst==undefined)
						isLastDir= isLastDir && subelems[i].isFile; // 디렉토리 안이 모두 파일이면 last dir
					}
					dirRead();
				}					 
			});
		};
		dirRead();
	}
	if(elem.isFile){


			elem.file(function(efile) {
			    droppedFiles.push(efile);				

				window.tempPath.push([elem.fullPath]);
				finisher(isFirst);
			});

}
}

