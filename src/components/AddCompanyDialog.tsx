import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Company } from '@/data/mockData';
import { Plus, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AddCompanyDialogProps {
  onAddCompany: (company: Company) => void;
}

const AddCompanyDialog = ({ onAddCompany }: AddCompanyDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    previousBalance: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Company name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Contact number is required';
    const parsedBalance = formData.previousBalance.trim()
      ? Number(formData.previousBalance)
      : 0;
    if (Number.isNaN(parsedBalance) || parsedBalance < 0) {
      newErrors.previousBalance = 'Enter a valid previous balance (0 or more)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newCompany: Company = {
      id: `new-${Date.now()}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      // GST/state not captured in this simplified flow
      gstNo: 'NA',
      address: formData.address.trim(),
      state: '',
      stateCode: '',
      pendingAmount: Number.isNaN(parsedBalance) ? 0 : parsedBalance,
    };

    onAddCompany(newCompany);
    setFormData({ name: '', phone: '', address: '', previousBalance: '' });
    setErrors({});
    setOpen(false);
    
    toast({
      title: 'Company added',
      description: `${newCompany.name} has been added and selected`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Company
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Add New Company
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              placeholder="Enter company name"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                setErrors(prev => ({ ...prev, name: '' }));
              }}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Contact Number *</Label>
            <Input
              id="phone"
              placeholder="e.g., +91 98765 43210"
              value={formData.phone}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, phone: e.target.value }));
                setErrors(prev => ({ ...prev, phone: '' }));
              }}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address (optional)</Label>
            <Input
              id="address"
              placeholder="Enter full address"
              value={formData.address}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, address: e.target.value }));
                setErrors(prev => ({ ...prev, address: '' }));
              }}
            />
            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="previousBalance">Previous Balance</Label>
            <Input
              id="previousBalance"
              type="number"
              min={0}
              placeholder="e.g., 2000"
              value={formData.previousBalance}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, previousBalance: e.target.value }));
                setErrors(prev => ({ ...prev, previousBalance: '' }));
              }}
            />
            {errors.previousBalance && (
              <p className="text-xs text-destructive">{errors.previousBalance}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-1" />
              Add Company
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCompanyDialog;
