package os2;

public class Page_Table {
    public int page,blockno,swapspaceno;
    public int exists,modified;

    public Page_Table(int page, int blockno, int swapspaceno, int exists, int modified) {
        this.page = page;
        this.blockno = blockno;
        this.swapspaceno = swapspaceno;
        this.exists = exists;
        this.modified = modified;
    }
    @Override
    public String toString(){
        return page+"     "+blockno+"      "+swapspaceno+"       "+exists+"      "+modified;
    }
}
