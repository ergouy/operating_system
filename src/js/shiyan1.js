var arr1 = [];//记录当前数组的状态
var arr2 = new Array();//记录空闲块
var count = 0;
var fn = new Node("",150);//初始内存块
arr1.push(fn);
arr2.unshift(150);
var read = [];
var run = [];
var bloc = [];//三兄弟
var neicun = [];//内存位示图
var waicun = [];//外存位示图
var loadnum = 3;
var blocksize = 10;
var jindu_len = 0;

function PageTable(page,blockno,swapspaceno,exists,modified){
    this.page = page;
    this.blockno = blockno;
    this.swapspaceno = swapspaceno;
    this.exists = exists;
    this.modified = modified;
}
function Node(namea,sizea){
        this.namea = namea;
        this.sizea = sizea;
        this.pagetable = [];//数组
        this.fifo = [];//队列
        this.lru = [];//队列
}

//实验三
function IoNode(name) {
    this.name = name;
    this.process = null;//执行进程
    this.parent = new Array();//数组
    this.waitDeque = new Array();//队列
}
var dets = new Array();
var cocts = new Array();
var chcts = new Array();
//------
//
function init_bitmap(){//初始化位示图
for(var i=0; i<8; ++i){//初始化内存
    neicun[i] = new Array();
    for(var j=0; j<8; ++j){
        neicun[i][j] = Math.round(Math.random());
    }
}
for(var i=0; i<16; ++i){//初始化外存
    waicun[i] = new Array();
    for(var j=0; j<8; ++j){
        waicun[i][j] = Math.round(Math.random());
    }
}

}

//初始化位示图
//------------------------------------

function showbitmap(){//显示位示图
    var val = document.getElementById("in_op1").value;
    document.getElementById("div_select").value = val;
    var str1 = "内存位示图:"+"\n";
    for(var i=0;i<neicun.length;++i){
        for(var j=0;j<neicun[i].length;++j){
            str1 += neicun[i][j];
        }
        str1 += " ";
        if((i+1)%4 == 0){
            str1 += '\n';
        }
    }
    alert(str1);
    var str2 = "外存位示图:"+"\n";
    for(var i=0;i<waicun.length;++i){
        for(var j=0;j<waicun[i].length;++j){
            str2 += waicun[i][j];
        }
        str2 += " ";
        if((i+1)%4 == 0){
            str2 += "\n";
        }
    }
    alert(str2);
}
//
function getfreeblock(ar){
    var biaozhi = false;
    for(var i=0; i<ar.length; ++i){
        for(var j=0; j<ar[i].length;++j){
            if(ar[i][j] == 0){
                biaozhi = true;
                ar[i][j] = 1;
                return i*8+j;
            }
        }
    }
    if(!biaozhi){
        alert("没有内存块了!!");
        return -1;
    }
}
//显示页表
function createhead(){
    var tr = document.createElement("tr");

    var td = document.createElement("td");
    var text = document.createTextNode("页号");
    td.appendChild(text);
    var td1 = document.createElement("td");
    var text1 = document.createTextNode("块号");
    td1.appendChild(text1);
    var td2 = document.createElement("td");
    var text2 = document.createTextNode("置换空间");
    td2.appendChild(text2);
    var td4 = document.createElement("td");
    var text4 = document.createTextNode("存在位");
    td4.appendChild(text4);
    var td5 = document.createElement("td");
    var text5 = document.createTextNode("修改位");
    td5.appendChild(text5);
    tr.appendChild(td);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td4);
    tr.appendChild(td5);

    return tr;
}
function createtr(texts){
    var tr=document.createElement("tr");

    var td = document.createElement("td");
    var text = document.createTextNode(texts.page);
    td.appendChild(text);
    var td1 = document.createElement("td");
    var text1 = document.createTextNode(texts.blockno);
    td1.appendChild(text1);
    var td2 = document.createElement("td");
    var text2 = document.createTextNode(texts.swapspaceno);
    td2.appendChild(text2);
    var td4 = document.createElement("td");
    var text4 = document.createTextNode(texts.exists);
    td4.appendChild(text4);
    var td5 = document.createElement("td");
    var text5 = document.createTextNode(texts.modified);
    td5.appendChild(text5);
    tr.appendChild(td);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td4);
    tr.appendChild(td5);

    return tr;
}

function createtable(pageta){
    var table = document.createElement("table");
    table.appendChild(createhead());
    for(var i=0;i<pageta.length;++i){
        var tr = createtr(pageta[i]);
        table.appendChild(tr);
    }
    return table;
}

function showpagetable(){
    var val = document.getElementById("in_op1").value;
    document.getElementById("div_select").value = val;

    var node = run[run.length-1];
    var pageta = node.pagetable;//节点里的页表
    var table = createtable(pageta);
    var div = document.getElementById("in_d4");
    div.innerHTML = "";
    div.appendChild(table);
}
//
//进度条显示
function jindutiao() {
    var ppp = jindu_len*4.5;
    console.log(jindu_len);
    console.log(jindu_len/150);
    $("#div_boot_jindutiao").css("width",ppp);
    document.getElementById("div_boot_jindutiao").innerText = jindu_len/150 * 100 + "%";
}
//
//地址转换
function address_translate(){
    var val = document.getElementById("in_op1").value;
    document.getElementById("div_select").value = val;
    //
    var node = run[run.length-1];
    if(node != undefined){
        var message = parseInt(prompt("请输入逻辑地址:"));
        if(message > node.sizea){
            alert("越界了");
        }else{
            var pageno = Math.floor(message/blocksize);
            var offset = message%blocksize;
            if(node.pagetable[pageno].exists > 0){
                alert("物理地址是:"+ (node.pagetable[pageno].blockno * blocksize + offset));
                node.lru.splice(node.lru.indexOf(pageno),1);
                node.lru.unshift(pageno);
            }else{
                var content =pageno+"号页不在内存中"+"\n"+"1.FIFO算法"+"\n"+"2.LRU算法"+"\n"+"请选择:"
                var choice = parseInt(prompt(content));
                if(choice == 1){
                    var swapno = node.fifo.pop();
                    if(node.pagetable[swapno].swapspaceno > 0){//在外存有空间
                        if(node.pagetable[swapno].modified > 0){//被修改过
                            alert("换出第"+swapno+"页,并且写入外存");
                        }else{
                            alert("仅换出第"+swapno+"页");
                        }
                    }else{//在外存无空间
                        node.pagetable[swapno].swapspaceno = getfreeblock(waicun);
                        var stt = "把"+swapno+"号页换出到外存的"+node.pagetable[swapno].swapspaceno+"号块"
                        //alert("把"+swapno+"号页换出到外存的"+node.pagetable[swapno].swapspaceno+"号块");
                        node.pagetable[swapno].exists = -1;
                        node.pagetable[swapno].modified = -1;
                        //换入
                        node.pagetable[pageno].blockno = node.pagetable[swapno].blockno;
                        node.pagetable[swapno].blockno = -1;
                        node.pagetable[pageno].exists = 1;
                        node.pagetable[pageno].modified = -1;
                        node.fifo.unshift(pageno);
                        var sdd = "\n转换后"+pageno+"号页物理地址是:"+(node.pagetable[pageno].blockno * blocksize +offset);
                        alert(stt+"\n"+"把"+pageno+"号页装入到"+ node.pagetable[pageno].blockno +"号块"+sdd);
                    }
                }else if(choice == 2){
                    var swapno = node.lru.pop();
                    if(node.pagetable[swapno].swapspaceno > 0){//在外存有空间
                        if(node.pagetable[swapno].modified > 0){//被修改过
                            alert("换出第"+swapno+"页,并且写入外存");
                        }else{
                            alert("仅换出第"+swapno+"页");
                        }
                    }else{//在外存无空间
                        node.pagetable[swapno].swapspaceno = getfreeblock(waicun);
                        var stt = "把"+swapno+"号页换出到外存的"+node.pagetable[swapno].swapspaceno+"号块"
                        //alert("把"+swapno+"号页换出到外存的"+node.pagetable[swapno].swapspaceno+"号块");
                        node.pagetable[swapno].exists = -1;
                        node.pagetable[swapno].modified = -1;
                        //换入
                        node.pagetable[pageno].blockno = node.pagetable[swapno].blockno;
                        node.pagetable[swapno].blockno = -1;
                        node.pagetable[pageno].exists = 1;
                        node.pagetable[pageno].modified = -1;
                        node.lru.unshift(pageno);
                        var sdd = "\n转换后"+pageno+"号页物理地址是:"+(node.pagetable[pageno].blockno * blocksize +offset);
                        alert(stt+"\n"+"把"+pageno+"号页装入到"+ node.pagetable[pageno].blockno +"号块"+sdd);
                    }
                }
            }
        }
    }
}
//
//结束进程
function endp(){
    var node = run[run.length-1];
    if(node != undefined){
        var pagetable = node.pagetable;
        for(var k=0; k<pagetable.length;++k){
            if(pagetable[k].exists > 0){
                var i = Math.floor(pagetable[k].blockno/blocksize);
                var j = pagetable[k].blockno%blocksize;
                neicun[i][j] = 0;
            }
            if(pagetable[k].swapspaceno > 0){
                var i = Math.floor(pagetable[k].swapspaceno/8);
                var j = pagetable[k].swapspaceno%8;
                waicun[i][j] = 0;
            }
        }

    }
}

//
function find(node){//找空闲内存块
    var sign = 0;
    arr2.sort();
    for(var i=0; i<arr2.length; ++i){
        if(node.sizea <= arr2[i]){
            sign = 1;
            count = arr2[i];
            arr2.splice(i,1);
            return true;
        }
    }
    if(sign == 0){
        alert("没有合适的块了");
        count = -1;
        return false;
    }
}
function tianchong(pos,hei){
    var c=document.getElementById("myCanvas");
    var cxt=c.getContext("2d");
    cxt.fillStyle="#FF0000";
    cxt.fillRect(0,pos,300,hei);
}
function qudiao(pos,hei){
    var c=document.getElementById("myCanvas");
    var cxt=c.getContext("2d");
    cxt.fillStyle="#F0F8FF";
    cxt.fillRect(0,pos,300,hei);
}
//
function endprocess(){
    var cle = document.getElementById("in_d4");
    cle.innerHTML = "";
    //
    var flag_end;//记录下标
    var bj_1,bj_2;
    var top = run.pop();
    var sum = 0;
    for(var i=0; i<arr1.length;++i){
        if(arr1[i].namea == top.namea){
            flag_end = i;
            break;
        }else{
            sum += arr1[i].sizea;
        }
    }
    jindu_len -= top.sizea;
    qudiao(sum,top.sizea);
    jindutiao();
    if(flag_end-1 >= 0 && arr1[flag_end-1].namea == ""){
        arr1[flag_end].sizea += arr1[flag_end-1].sizea;
        arr2.splice(arr2.indexOf(arr1[flag_end-1].sizea),1);
        bj_1 = true;
    }
    if(flag_end+1 < arr1.length && arr1[flag_end+1].namea == ""){
        arr1[flag_end].sizea += arr1[flag_end+1].sizea;
        arr2.splice(arr2.indexOf(arr1[flag_end+1].sizea),1);
        bj_2 = true;
    }
    arr1[flag_end].namea = "";
    arr2.unshift(arr1[flag_end].sizea);
    if(bj_1){arr1.splice(flag_end-1,1);}
    if(bj_2){arr1.splice(flag_end+1,1);}
}
//
function tostr(arr){
    var str = "";
    for(var i=0; i<arr.length;++i){
        str += arr[i].namea+" ";
    }
    return str;
}
//
function show(){
    var s_ready = document.getElementById("in_ready");
    var s_run = document.getElementById("in_run");
    var s_block = document.getElementById("in_block");
    s_ready.innerHTML = tostr(read);
    s_run.innerHTML = tostr(run);
    s_block.innerHTML = tostr(bloc);
    var val = document.getElementById("in_op1").value;
    document.getElementById("div_select").value = val;
}
//
$("#div_button").click(
    function(){
        var nameb = document.getElementById("div_name").value;
        var sizeb = parseInt(document.getElementById("div_size").value);
        var node = new Node(nameb,sizeb);
        if(find(node)){
            for(var i=0; i<Math.ceil(sizeb/blocksize);++i){
                if(i<loadnum){
                    var pt = new PageTable(i,getfreeblock(neicun),-1,1,-1);
                    node.pagetable[i] = pt;
                }else{
                    var pt = new PageTable(i,-1,getfreeblock(waicun),-1,-1);
                    node.pagetable[i] = pt;
                }
            }

            for (var i=0; i<loadnum; ++i){
                if (i < node.pagetable.length){
                    node.fifo.unshift(i);
                    node.lru.unshift(i);
                }
            }

            read.unshift(node);
            if(run.length == 0){
                run.unshift(read.pop());
            }
            show();
            var sum = 0;
            for(var i=0; i<arr1.length; ++i){
                if(arr1[i].sizea == count && arr1[i].namea == ""){
                    jindu_len += sizeb;
                    tianchong(sum,sizeb);
                    var pn = new Node("",arr1[i].sizea-sizeb);
                    arr2.unshift(pn.sizea);
                    arr1.splice(i+1,0,pn);
                    arr1[i].namea = nameb;
                    arr1[i].sizea = sizeb;
                    break;
                }else{
                    sum = sum + arr1[i].sizea;
                }
            }
            jindutiao();
        }
    }
);

//
$("#div_select").change(function(){
   var message = $("#div_select option:selected").text();
   switch (message){
       case '时间片到':
           if(run.length != 0){
               read.unshift(run.pop());
           }
           if(read.length != 0){
               run.unshift(read.pop());
           }
           show();
           break;
       case '阻塞进程':
           if(run.length != 0){
               bloc.unshift(run.pop());
           }
           if(read.length != 0){
               run.unshift(read.pop());
           }
           show();
           break;
       case '唤醒进程':
           if(bloc.length != 0){
               read.unshift(bloc.pop())
           }
           if(run.length == 0 && read.length != 0){
               run.unshift(read.pop());
           }
           show();
           break;
       case '结束进程':
           endp();
           endprocess();
           if(read.length != 0){
               run.unshift(read.pop());
           }
           show();
           break;
       case '位示图':
           showbitmap();
           break;
       case '进程页表':
           showpagetable();
           break;
       case '地址转换':
           address_translate();
           break;
   }
});
//-------------------------------------------
//实验三


//队列三兄弟
//----------
function Init() {
    var device1 = new IoNode("设备1");
    var device2 = new IoNode("设备2");
    var device3 = new IoNode("设备3");
    var device4 = new IoNode("设备4");

    var controller1 = new IoNode("控制器1");
    var controller2 = new IoNode("控制器2");
    var controller3 = new IoNode("控制器3");

    var enterclose1 = new IoNode("通道1");
    var enterclose2 = new IoNode("通道2");

    device1.parent.push(controller1);
    device2.parent.push(controller1);
    device3.parent.push(controller2);
    device4.parent.push(controller3);
    controller1.parent.push(enterclose1);
    controller2.parent.push(enterclose1);
    controller3.parent.push(enterclose2);

    dets.push(device1);
    dets.push(device2);
    dets.push(device3);
    dets.push(device4);
    cocts.push(controller1);
    cocts.push(controller2);
    cocts.push(controller3);
    chcts.push(enterclose1);
    chcts.push(enterclose2);

}
//
function containFather(fathername,list) {
    for(var i=0; i<list.length; ++i){
        if(list[i].name == fathername){
            return true;
        }
    }
    return false;
}
//
function showStatus(){
    var td_ul = $("#tree");
    td_ul.empty();
    var str = "<img class='addIcon' src='add.png'><img class='deleteIcon' src='delete.png'>";
    for(var i=0; i<chcts.length; ++i){
        var td_li = $("<li><span class='folder' id='tongdao' title='通道'>"+chcts[i].name+str+"</span></li>");
        var kzq_ul = $("<ul></ul>");
        for(j=0; j<cocts.length; ++j){//遍历控制器
            if(containFather(chcts[i].name,cocts[j].parent)){
                var kzq_li = $("<li><span class='folder' id='kongzhiqi' title='控制器'>"+cocts[j].name+str+"</span></li>");
                var sb_ul = $("<ul></ul>");
                for(k=0; k<dets.length; ++k){
                    if(containFather(cocts[j].name,dets[k].parent)){
                        var sb_li = $("<li><span class='folder' id='shebei' title='设备'>"+dets[k].name+"<img class='addIcon' src='tianjia.jpg'><img id='shanchu' src='shanchu.png'><img class='deleteIcon' src='delete.png'>"+"</span></li>");
                        sb_ul.append(sb_li);
                    }
                }//设备列添加完成
                kzq_li.append(sb_ul);
                kzq_ul.append(kzq_li);
            }
        }//控制器添加完成
        td_li.append(kzq_ul);
        td_ul.append(td_li);
    }
    td_ul.treeview();
}
//初始化
$(function(){
    init_bitmap();
    Init();
    showStatus();
});
//鼠标悬停 和 鼠标离开 ---------------------------------
$("body").on("mouseenter",".folder",function(){
    $(this).children().css("visibility", "visible");
    //$(".deleteIcon").css("visibility", "visible");
});
$("body").on("mouseleave",".folder",function(){
    $(this).children().css("visibility", "hidden");
    //$(".deleteIcon").css("visibility", "hidden");
});
//点击效果----
function findMessage(name,list) {
    var message = "运行进程:";
    for(var i=0; i<list.length; ++i){
        if(list[i].name == name){
            if(list[i].process != null){
                message += list[i].process.namea;
            }
            message += "\n";
            message += "等待进程:";
            for(var j=0; j<list[i].waitDeque.length; ++j){
                message += list[i].waitDeque[j].namea;
            }
            message += "\n";
            return message;
        }
    }
}
//
$("body").on("click",".folder",function () {
    var text = $(this).text();
    var id = $(this).attr("id");
    var str = "";
    switch(id){
        case "tongdao":
            str = findMessage(text,chcts);
            break;
        case "kongzhiqi":
            str = findMessage(text,cocts);
            break;
        case "shebei":
            str = findMessage(text,dets);
            break;
        default:
            alert("出错了");
            break;
    }
    $(this).attr("title",str);
});

//-----------------------------------------------------------------------
function addDevice(sonname,fathername,sonlist,fatherlist){
    var newIonode = new IoNode(sonname);
    for(var i=0; i<fatherlist.length; ++i){
        if(fatherlist[i].name == fathername){
            newIonode.parent.push(fatherlist[i]);
            sonlist.push(newIonode);
            break;
        }
    }
}


//---分---配---设---备----
//------找到最短的队列放进去
function minLength(process,list) {
    var position = 0;
    var val = list[0].waitDeque.length;
    for(var i=1; i<list.length; ++i){
        if(list[i].waitDeque.length < val){
            position = i;
            val = list[i].waitDeque.length;
        }
    }
    list[position].waitDeque.push(process);
}
//
function allocationPass(process,passlist) {//分配控制器
    var tnum = -1;
    for(var i=0; i<passlist.length; ++i){
        if(passlist[i].process == null && passlist[i].waitDeque.length == 0){
            tnum = 1;
            passlist[i].process = process;
            console.log("通道分配成功");
            break;
        }
    }
    if(tnum < 0){
        minLength(process,passlist);
    }
}
//
function allocationController(process,controllerlist) {//分配控制器
    var knum = -1;
    for(var i=0; i<controllerlist.length; ++i){
        if(controllerlist[i].process == null && controllerlist[i].waitDeque.length == 0){
            knum = 1;
            controllerlist[i].process = process;
            console.log("控制器分配成功");
            allocationPass(process,controllerlist[i].parent);
            break;
        }
    }
    if(knum < 0){
        minLength(process,controllerlist);
    }
}
//
function allocationDevice(process,devicenode){//分配设备
    if(devicenode.process == null && devicenode.waitDeque.length == 0){
        devicenode.process = process;
        console.log("设备分配成功");
        bloc.push(run.shift());
        run.push(read.shift());
        allocationController(process,devicenode.parent);
    }else{
        devicenode.waitDeque.push(process);
        bloc.push(run.shift());
        if(read.length != 0){
            run.push(read.shift());
        }
    }
}
//
function  allocation(deviceNmae) {
    var process = run[0];//待分配的进程
    for(var i=0; i<dets.length; ++i){
        if(dets[i].name == deviceNmae){
            allocationDevice(process,dets[i]);
            break;
        }
    }
}
//-- -- --  -- -- -- -- --
$("body").on("click",".addIcon",function(){
    var span = $(this).parent();
    var fname = span.text();//父节点名
    var id = span.attr("id");//父节点的数组名
    if(id != "shebei"){
        var sname = prompt("请输入子节点名称:");
    }else{
        sname = "peiqi";
    }
    if (sname != null && sname != ""){
        switch (id){
            case "tongdao":
                addDevice(sname,fname,cocts,chcts);
                break;
            case "kongzhiqi":
                addDevice(sname,fname,dets,cocts);
                break;
            case "shebei":
                allocation(fname);
                show();
                break;
            default:
                alert("出错了");
                break;
        }
        showStatus();
    }
});
//删除设备-----------------------------------------
function deleteIonode(name,thislist) {
    for(var i=0; i<thislist.length; ++i){
        if(thislist[i].name == name){
            if(thislist[i].process == null && thislist[i].waitDeque.length == 0){
                thislist.splice(i,1);
            }
            break;
        }
    }
}
//
function count2(name,slist) {
    var num = 0;
    for(var i=0; i<slist.length; ++i){
        for(var j=0; j<slist[i].parent.length; ++j){
            if(slist[i].parent[j].name == name){
                ++num;
            }
        }
    }
    return num;
}

function deleteDevice(name,thislist,slist){
    for(var i=0; i<thislist.length; ++i){
        if(thislist[i].name == name){
            if(count2(name,slist) <= 0){
                deleteIonode(name,thislist);
            }
        }
    }
}
//
$("body").on("click",".deleteIcon",function(){
    var span = $(this).parent();
    var fname = span.text();//要删除节点名称
    var id = span.attr("id");//节点所在数组
    switch (id){
        case "tongdao":
            deleteDevice(fname,chcts,cocts);
            break;
        case "kongzhiqi":
            deleteDevice(fname,cocts,dets);
            break;
        case "shebei":
            deleteIonode(fname,dets);
            break;
        default:
            alert("出错了");
            break;
    }
    showStatus();
});
//---------------------------------------------------
//释放进程
$("body").on("click","#shanchu",function () {
    var span = $(this).parent();
    var devicename = span.text();
    for(var i=0; i<dets.length; ++i){
        if(dets[i].name == devicename){
            if(dets[i].process != null){//设备对应的进程不空
                var process = dets[i].process;//记录要释放的进程
                if(dets[i].waitDeque.length != 0){
                    dets[i].process = dets[i].waitDeque.shift();
                    allocationController(dets[i].process,dets[i].parent);
                }else{
                    dets[i].process = null;
                }
                //释放控制器
                for(var j=0; j<dets[i].parent.length; ++j){
                    if(dets[i].parent[j].process.namea == process.namea){
                        if(dets[i].parent[j].waitDeque.length != 0){
                            dets[i].parent[j].process = dets[i].parent[j].waitDeque.shift();
                            allocationPass(dets[i].parent[j].process,dets[i].parent[j].parent);
                        }else{
                            dets[i].parent[j].process = null;
                        }
                        //释放通道
                        var controller = dets[i].parent[j];
                        for(var k=0; k<controller.parent.length; ++k){
                            if(controller.parent[k].process.namea == process.namea){
                                if(controller.parent[k].waitDeque.length != 0){
                                    controller.parent[k].process = controller.parent[k].waitDeque.shift();
                                }else{
                                    controller.parent[k].process = null;
                                }
                                for(var q=0; q<bloc.length; ++q){
                                    if(bloc[q].namea == process.namea){
                                        read.push(bloc[q]);
                                        bloc.splice(q,1);
                                        if(run.length == 0){
                                            run.push(read.shift());
                                        }
                                        break;
                                    }
                                }
                                console.log("释放成功");
                                show();
                            }
                        }

                    }
                }

            }
            break;
        }
    }

});

