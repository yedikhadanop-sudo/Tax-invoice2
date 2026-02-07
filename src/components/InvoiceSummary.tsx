import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { InvoiceItem, Company } from '@/data/mockData';
import { Calculator, TrendingUp } from 'lucide-react';

interface InvoiceSummaryProps {
  items: InvoiceItem[];
  company: Company | null;
}

const InvoiceSummary = ({ items, company }: InvoiceSummaryProps) => {
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const baseAmount = item.item.rate * item.quantity;
      const discountAmount = (baseAmount * item.discount) / 100;
      return sum + (baseAmount - discountAmount);
    }, 0);
  };

  const calculateTotalDiscount = () => {
    return items.reduce((sum, item) => {
      const baseAmount = item.item.rate * item.quantity;
      return sum + (baseAmount * item.discount) / 100;
    }, 0);
  };

  const calculateGstBreakdown = () => {
    const gstMap = new Map<number, { cgst: number; sgst: number; igst: number }>();
    
    items.forEach(item => {
      const taxableAmount = item.item.rate * item.quantity * (1 - item.discount / 100);
      const gstAmount = (taxableAmount * item.item.gstRate) / 100;
      
      const existing = gstMap.get(item.item.gstRate) || { cgst: 0, sgst: 0, igst: 0 };
      
      // If same state, split into CGST + SGST, otherwise IGST
      const isSameState = company?.stateCode === '27'; // Assuming seller is in Maharashtra
      
      if (isSameState) {
        existing.cgst += gstAmount / 2;
        existing.sgst += gstAmount / 2;
      } else {
        existing.igst += gstAmount;
      }
      
      gstMap.set(item.item.gstRate, existing);
    });
    
    return gstMap;
  };

  const calculateTotalGst = () => {
    return items.reduce((sum, item) => {
      const taxableAmount = item.item.rate * item.quantity * (1 - item.discount / 100);
      return sum + (taxableAmount * item.item.gstRate) / 100;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const totalDiscount = calculateTotalDiscount();
  const totalGst = calculateTotalGst();
  const grandTotal = subtotal + totalGst;
  const gstBreakdown = calculateGstBreakdown();
  const isSameState = company?.stateCode === '27';

  return (
    <Card className="shadow-card animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Calculator className="h-5 w-5 text-primary" />
          Invoice Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">
            Add items to see the summary
          </p>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal (before discount)</span>
              <span className="font-mono">₹{(subtotal + totalDiscount).toLocaleString()}</span>
            </div>
            
            {totalDiscount > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Discount</span>
                <span className="font-mono">-₹{totalDiscount.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm font-medium">
              <span>Taxable Amount</span>
              <span className="font-mono">₹{subtotal.toLocaleString()}</span>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              {Array.from(gstBreakdown.entries()).map(([rate, values]) => (
                <div key={rate} className="space-y-1">
                  {isSameState ? (
                    <>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>CGST @ {rate / 2}%</span>
                        <span className="font-mono">₹{values.cgst.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>SGST @ {rate / 2}%</span>
                        <span className="font-mono">₹{values.sgst.toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>IGST @ {rate}%</span>
                      <span className="font-mono">₹{values.igst.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between text-sm font-medium">
              <span>Total GST</span>
              <span className="font-mono">₹{totalGst.toLocaleString()}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-semibold">Grand Total</span>
              <span className="text-2xl font-bold font-mono text-primary">
                ₹{grandTotal.toLocaleString()}
              </span>
            </div>

            {company?.pendingAmount && company.pendingAmount > 0 && (
              <>
                <Separator />
                <div className="rounded-lg bg-warning/10 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-warning font-medium">
                    <TrendingUp className="h-4 w-4" />
                    Previous Balance
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pending Amount</span>
                    <span className="font-mono">₹{company.pendingAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total Payable</span>
                    <span className="font-mono">₹{(grandTotal + company.pendingAmount).toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceSummary;
