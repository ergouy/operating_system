package os2;

import java.text.NumberFormat;

public class Test {
    public static void main(String[] args) {
        NumberFormat nf = NumberFormat.getPercentInstance();
        nf.setMaximumFractionDigits(2);
        System.out.println();
    }
}
