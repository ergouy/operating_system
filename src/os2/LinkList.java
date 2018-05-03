package os2;

import java.text.NumberFormat;
import java.util.*;

/**
 * @author Administrator
 */
public class LinkList {
    Node head;//头结点
    List<Integer> la;//空碎片排序集合
    static ArrayDeque<Node> ready ;//就绪
    static ArrayDeque<Node> block;//阻塞
    static ArrayDeque<Node> run;//运行
    static final int blocksize = 1024;//块的大小
    static final int mersize = 64;//块的个数
    static final int swap_space_size = 128;//置换空间的大小
    static final int loadcount = 3;//一个进程分配3块内存空间
    static char[] bitmap;//内存的位示图
    static char[] swapbitmap;//置换空间的位示图
    static int suc = 0;//用于计算FIFO算法缺页率
    static int dec = 0;
    static int suc1 = 0;//用于计算LRU算法缺页率
    static int dec1 = 0;

    public LinkList(Node in) {
        head = new Node("头结点", -100);
        head.pre = null;
        head.next = in;
        in.pre = head;
        in.next = null;
        la = new ArrayList<Integer>();
        la.add(in.size);
    }
    int findRm(Node node){
        la.sort((o1,o2)->(o1 - o2));
        int flag = -1;
        for (int i = 0; i < la.size(); ++i){
            if (la.get(i) >= node.size){
                flag = la.get(i);
                la.remove(i);
                break;
            }
        }
        return flag;
    }

    void addNode(Node node){
        int num = findRm(node);
        if(num > 0){
            Node r = head.next;
            while(r != null){
                /**
                 * 找到了对应的空闲节点
                 */
                if (r.size == num &&"".equals(r.name)){
                    /**
                     * 正好相等不需要做特殊的处理
                     */
                    if(node.size == r.size){
                        r.name = node.name;
                        r.size = node.size;
                    }else if(node.size < r.size){
                        /**
                         * 空白较多需要做特殊的处理
                         */
                        Node nd = new Node("",r.size-node.size);
                        r.size = node.size;
                        r.name = node.name;
                        nd.next = r.next;
                        nd.pre = r;
                        r.next = nd;
                        la.add(nd.size);
                    }
                    break;

                }else{
                    r = r.next;
                }

            }
        }else{
            System.out.println("没有内存了");
        }

    }

    void deleteNode(String name){
        Node r = head.next;
        boolean flag = false;
        while(r != null){
            if(name.equals(r.name)){
                flag = true;
                r.name = "";
                /**
                 * r.next != null的情况
                 */
                if (r.next != null){
                    if("".equals(r.pre.name)  && "".equals(r.next.name) ){
                        la.remove((Integer)r.pre.size);
                        la.remove((Integer)r.next.size);
                        r.size += (r.pre.size + r.next.size);
                        r.pre = r.pre.pre;
                        r.pre.next = r;
                        r.next = r.next.next;
                        if(r.next != null){
                            r.next.pre = r;
                        }
                    }else if("".equals(r.pre.name) && !("".equals(r.next.name))){
                        la.remove((Integer)r.pre.size);
                        r.size += r.pre.size;
                        r.pre = r.pre.pre;
                        r.pre.next = r;
                    }else if(!("".equals(r.pre.name))  && "".equals(r.next.name)){
                        la.remove((Integer)r.next.size);
                        r.size += r.next.size;
                        r.next = r.next.next;
                    }else{}
                    la.add(r.size);
                }else{/** r.next == null 的情况*/
                    if("".equals(r.pre.name)){
                        la.remove((Integer)r.pre.size);
                        r.size += r.pre.size;
                        r.pre = r.pre.pre;
                        r.pre.next = r;
                    }else{
                    }
                    la.add(r.size);
                }

            }else{
                r = r.next;
            }
        }
        if (!flag){
            System.out.println("没找到");
        }
    }


    /*返回位示图的某一位*/
    public static int get_bit(char b,int bit_no){
        char mask = (char)((char)1<<bit_no);
        if((b & mask) == 0){
            return 0;
        }else{
            return 1;
        }
    }
    /*设置内存位示图的某一位*/
    public static void set_bit(int position,int bit_no,int fla){
        char mask = (char)((char)1<<bit_no);
        if(fla == 1){
            bitmap[position] = (char) (bitmap[position]|mask);
        }else{
            mask = (char) ~mask;
            bitmap[position] = (char) (bitmap[position]&mask);
        }
    }
    /*设置外存位示图的某一位*/
    public static void set_swap_bit(int position,int bit_no,int fla){
        char mask = (char)((char)1<<bit_no);
        if(fla == 1){
            swapbitmap[position] = (char) (swapbitmap[position]|mask);
        }else{
            mask = (char) ~mask;
            swapbitmap[position] = (char) (swapbitmap[position]&mask);
        }
    }


 /*显示位示图*/
public static void display_bitmap(){
    System.out.println("内存的位示图");
    for (int i=0; i<mersize/8; ++i){
        for (int j=0; j<8; ++j){
            System.out.print(get_bit(bitmap[i],j));
        }
        System.out.print("  ");
    }
    System.out.println();
    System.out.println("置换空间位示图");
    for (int i=0; i<swap_space_size/8; ++i){
        for (int j=0; j<8; ++j){
            System.out.print(get_bit(swapbitmap[i],j));
        }
        System.out.print("  ");
        if ((i+1)%8 ==0 ){
            System.out.println();
        }
    }
}

/*显示当前执行进程的页表*/
public static void display_pagetable(){
    Node jiedian = run.peek();
    if(jiedian != null){
        System.out.println("页表:");
        System.out.println("下标"+" "+"页号"+"  "+"块号"+" "+"置换空间"+"  "+"存在位"+"  "+"修改位"+" ");
        for (int i=0; i<jiedian.pagetable.length ; ++i){
            System.out.println("  "+i+"   "+jiedian.pagetable[i]);
        }
        //
        System.out.println("FIFO访问队列");
        System.out.println(jiedian.fifo);
        //
        System.out.println("LRU访问队列");
        System.out.println(jiedian.lru);
    }
}

/*地址变换*/
public static void address_translate(){
    Node jiedian = run.peek();
    Scanner sc = new Scanner(System.in);
    if (jiedian != null){
        System.out.print("输入逻辑地址:");
        int la = sc.nextInt();
        sc.nextLine();
        if(la > jiedian.size){
            System.out.println("越界了!!");
        }else{
            int pageno = la/blocksize;
            int offset = la%blocksize;
            if(jiedian.pagetable[pageno].exists > 0){
                System.out.println("物理地址是:"+(jiedian.pagetable[pageno].blockno * blocksize + offset));
                jiedian.lru.remove(pageno);
                jiedian.lru.offer(pageno);
                ++suc;
                ++suc1;
            }else{
                System.out.println("#"+pageno+"页不在内存");
                System.out.println("1.FIFO算法");
                System.out.println("2.LRU算法");
                System.out.print("请选择:");
                int choice = sc.nextInt();
                sc.nextLine();
                if (choice == 1){
                    ++dec;
                    int swapno = jiedian.fifo.poll();//返回的是将要移除的页号
                    if(jiedian.pagetable[swapno].swapspaceno > 0 ){//在外存有空间
                        if (jiedian.pagetable[swapno].modified > 0){//被修改过了
                            System.out.println("换出第"+swapno+"页,并且写入外存");
                        }else{
                            System.out.println("换出第"+swapno+"页,不写入外存");
                        }
                    }else{//在外存没有空间
                        jiedian.pagetable[swapno].swapspaceno = getfree_Swapblock();
                        System.out.println("把"+swapno+"号页换出到块"+jiedian.pagetable[swapno].swapspaceno);
                    }
                    jiedian.pagetable[swapno].exists = -1;
                    jiedian.pagetable[swapno].modified = -1;
                    //换入
                    jiedian.pagetable[pageno].exists = 1;
                    jiedian.pagetable[pageno].blockno = jiedian.pagetable[swapno].blockno;
                    jiedian.pagetable[swapno].blockno = -1;
                    jiedian.pagetable[pageno].modified = -1;
                    jiedian.fifo.offer(pageno);
                    System.out.println("把"+pageno+"号页装入到块"+jiedian.pagetable[pageno].blockno);
                }else if(choice == 2){
                    ++dec1;
                    int swapno = jiedian.lru.poll();//返回的是将要移除的页号
                    if(jiedian.pagetable[swapno].swapspaceno > 0 ){//在外存有空间
                        if (jiedian.pagetable[swapno].modified > 0){//被修改过了
                            System.out.println("换出第"+swapno+"页,并且写入外存");
                        }else{
                            System.out.println("换出第"+swapno+"页,不写入外存");
                        }
                    }else{//在外存没有空间
                        jiedian.pagetable[swapno].swapspaceno = getfree_Swapblock();
                        System.out.println("把"+swapno+"号页换出到块"+jiedian.pagetable[swapno].swapspaceno);
                    }
                    jiedian.pagetable[swapno].exists = -1;
                    jiedian.pagetable[swapno].modified = -1;
                    //换入
                    jiedian.pagetable[pageno].exists = 1;
                    jiedian.pagetable[pageno].blockno = jiedian.pagetable[swapno].blockno;
                    jiedian.pagetable[swapno].blockno = -1;
                    jiedian.pagetable[pageno].modified = -1;
                    jiedian.lru.offer(pageno);
                    System.out.println("把"+pageno+"号页装入到块"+jiedian.pagetable[pageno].blockno);
                }
            }


        }


    }

}

/*初始化位示图*/
public static void init_bitmap(){
    /*内存空间位示图初始化*/
    bitmap = new char[mersize/8];
    Random rdm = new Random();
    for (int i=0; i<mersize/8 ; ++i){
        bitmap[i] = (char) ((char)rdm.nextInt()*(256-1));
    }
    /*置换空间位示图初始化*/
    swapbitmap = new char[swap_space_size/8];
    for (int j=0; j<swap_space_size/8; ++j){
        swapbitmap[j] = (char)((char)rdm.nextInt()*(256-1));
    }
}
/*找空闲 并返回块号*/
public static int getfreeblock(){
    for (int i=0; i<mersize/8; ++i){
        for (int j=0; j<8; ++j){
            if (get_bit(bitmap[i],j) == 0){
                set_bit(i,j,1);
                return i*8+j;
            }
        }
    }
    System.out.println("内存块已满");
    return -1;
}

public static  int getfree_Swapblock(){
    for (int i=0; i<swap_space_size/8; ++i){
        for (int j=0; j<8; ++j){
            if (get_bit(swapbitmap[i],j) == 0){
                set_swap_bit(i,j,1);
                return i*8+j;
            }
        }
    }
    System.out.println("内存块已满");
    return -1;
}

/*结束进程*/
public static void endProcess(){
    Node jiedian = run.peek();
    if (jiedian != null){
        Page_Table[] pagetable = jiedian.pagetable;
        for(int k=0; k<pagetable.length; ++k){
            if (pagetable[k].exists > 0){
                int j = (pagetable[k].blockno)%8;
                int i = (pagetable[k].blockno)/8;
                set_bit(i,j,0);
            }
            if(pagetable[k].swapspaceno >= 0){
                int j = (pagetable[k].swapspaceno)%8;
                int i = (pagetable[k].swapspaceno)/8;
                set_swap_bit(i,j,0);
            }
        }
        NumberFormat nf = NumberFormat.getPercentInstance();
        nf.setMaximumFractionDigits(2);
        System.out.println("FIFO算法置换次数:"+dec+" 缺页率:"+nf.format(((double)dec/(suc+dec))));
        System.out.println("LRU算法置换次数:"+dec1+" 缺页率:"+nf.format(((double)dec1/(suc1+dec1))));
    }
}

void show(){
        System.out.println("---------------");
        Node r = head.next;
        while(r != null){
            if ("".equals(r.name)){
                System.out.println(" "+"--"+r.size);
            }else {
                System.out.println(r.name+"--"+r.size);
            }

            r = r.next;
        }
    }
public static void show1(){
    System.out.print("就绪队列:");
    System.out.println(ready);
    System.out.print("运行:");
    System.out.println(run);
    System.out.print("阻塞队列:");
    System.out.println(block);
}



    public static void main(String[] args) {
        Node nd = new Node("",mersize*blocksize);
        LinkList ll = new LinkList(nd);
        ready = new ArrayDeque<>();
        run = new ArrayDeque<>();
        block = new ArrayDeque<>();
        init_bitmap();

        int flag = -1;
        while(flag != 0){
            System.out.println("---------------");
            System.out.println("1.创建进程");
            System.out.println("2.时间片到");
            System.out.println("3.进程阻塞");
            System.out.println("4.进程唤醒");
            System.out.println("5.结束进程");
            System.out.println("6.显示位示图");
            System.out.println("7.显示进程页表");
            System.out.println("8.地址转换");
            System.out.println("0.结束程序");
            Scanner sc = new Scanner(System.in);
            System.out.print("请选择: ");
            flag = sc.nextInt();
            sc.nextLine();
            if (flag == 1){
                System.out.print("名称: ");
                String name = sc.nextLine();
                System.out.print("大小: ");
                int size = sc.nextInt();
                Node node = new Node(name,size);
                node.pagetable = new Page_Table[(int)Math.ceil((double) size/blocksize)];
                for (int i=0; i<node.pagetable.length; ++i){
                    if (i<loadcount){
                        Page_Table pt = new Page_Table(i,getfreeblock(),-1,1,-1);
                        node.pagetable[i] = pt;
                    }else{
                        Page_Table pt = new Page_Table(i,-1,getfree_Swapblock(),-1,-1);
                        node.pagetable[i] = pt;
                    }
                }
                //
                for (int i=0; i<loadcount; ++i){
                    if (i < node.pagetable.length){
                        node.fifo.offer(i);
                        node.lru.offer(i);
                    }
                }

                ll.addNode(node);
                ready.offer(node);
                ll.show();
                if(run.isEmpty()){
                    run.offer(ready.poll());
                }
                show1();
            }else if(flag == 2){//时间片到
                ready.offer(run.poll());
                run.offer(ready.poll());
                show1();
            }else if(flag == 3){//进程阻塞
                block.offer(run.poll());
                run.offer(ready.poll());
                show1();
            }else if(flag == 4){//唤醒进程
                ready.offer(run.poll());
                run.offer(block.poll());
                show1();
            }else if(flag == 5){//结束进程
                endProcess();
                Node s = run.poll();
                if (!(ready.isEmpty())){
                    run.offer(ready.poll());
                }
                ll.deleteNode(s.name);
                ll.show();
                show1();
            }else if (flag == 6){
                display_bitmap();
            }else if(flag == 7){
                display_pagetable();
            }else if(flag == 8){
                address_translate();
            }
        }
    }


}
