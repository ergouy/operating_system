package os2;

import java.util.ArrayDeque;

public class Node {
    static final int loadcount = 3;//一个进程分配3块内存空间
    String name;
    int size;
    Page_Table[] pagetable;
    ArrayDeque<Integer> fifo,lru;//两种算法分别对应的访问队列
    Node pre;
    Node next;

    //
    public Node(String name, int size) {
        this.name = name;
        this.size = size;
        fifo = new ArrayDeque<>(loadcount);
        lru = new ArrayDeque<>(loadcount);
    }
    /*通用函数*/

    @Override
    public String toString(){
        return name+" ";
    }
}
