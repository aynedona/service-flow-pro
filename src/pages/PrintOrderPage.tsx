import { useParams, useNavigate } from "react-router-dom";
import { TopNav } from "@/components/layout/TopNav";
import { DesktopHeader } from "@/components/layout/DesktopHeader";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Printer, MessageCircle, ArrowLeft } from "lucide-react";
import { OrderStatus } from "@/components/ui/StatusBadge";

interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  services: { name: string; quantity: number; price: number }[];
  subtotal: number;
  discount: number;
  total: number;
  date: string;
  status: OrderStatus;
  priority?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  description?: string;
  observations?: string;
  address?: string;
}

const mockOrders: Record<string, Order> = {
  "001": { id: "001", clientName: "Maria Silva", clientPhone: "(11) 99999-1111", services: [{ name: "Manutenção Preventiva", quantity: 1, price: 150.0 }], subtotal: 150.0, discount: 0, total: 150.0, date: "2025-01-05", status: "progress", priority: "medium", scheduledDate: "2025-01-06", scheduledTime: "14:00", description: "Verificar sistema de refrigeração", observations: "Cliente solicitou agendamento para o período da tarde.", address: "Av. Paulista, 1000 - Bela Vista, SP" },
  "002": { id: "002", clientName: "João Santos", clientPhone: "(11) 99999-2222", services: [{ name: "Instalação Elétrica", quantity: 1, price: 250.0 }, { name: "Pintura", quantity: 1, price: 350.0 }], subtotal: 600.0, discount: 50.0, total: 550.0, date: "2025-01-04", status: "waiting", observations: "Aguardando aprovação do orçamento.", address: "Rua Funchal, 418 - Vila Olímpia, SP" },
  "003": { id: "003", clientName: "Ana Oliveira", clientPhone: "(11) 99999-3333", services: [{ name: "Reparo Hidráulico", quantity: 1, price: 180.0 }], subtotal: 180.0, discount: 0, total: 180.0, date: "2025-01-03", status: "finished" },
};

const statusLabels: Record<OrderStatus, string> = { start: "Iniciar", progress: "Em andamento", waiting: "Aguardando", cancelled: "Cancelado", finished: "Finalizado" };
const priorityLabels: Record<string, string> = { low: "Baixa", medium: "Média", high: "Alta", urgent: "Urgente" };

export default function PrintOrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = id ? mockOrders[id] : null;

  if (!order) {
    return (
      <div className="page-container bg-background">
        <TopNav title="Imprimir Ordem" showBack />
        <div className="content-container"><div className="text-center py-16"><p className="text-muted-foreground">Ordem não encontrada</p></div></div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("pt-BR");

  const handlePrint = () => {
    const printContent = `<html><head><title>Ordem #${order.id}</title><style>@page{size:80mm auto;margin:0}body{font-family:'Courier New',monospace;font-size:12px;width:72mm;margin:4mm;padding:0}.header{text-align:center;margin-bottom:8px}.title{font-size:16px;font-weight:bold}.divider{border-top:1px dashed #000;margin:8px 0}.row{display:flex;justify-content:space-between;margin:4px 0}.service{margin:4px 0}.total{font-size:14px;font-weight:bold;margin-top:8px}.footer{text-align:center;margin-top:16px;font-size:10px}</style></head><body>
      <div class="header"><div class="title">ORDEM DE SERVIÇO</div><div>#${order.id}</div></div><div class="divider"></div>
      <div class="row"><span>Data:</span><span>${formatDate(order.date)}</span></div>
      <div class="row"><span>Status:</span><span>${statusLabels[order.status]}</span></div>
      ${order.priority ? `<div class="row"><span>Prioridade:</span><span>${priorityLabels[order.priority] || order.priority}</span></div>` : ''}
      ${order.scheduledDate ? `<div class="row"><span>Agendado:</span><span>${formatDate(order.scheduledDate)}${order.scheduledTime ? ` ${order.scheduledTime}` : ''}</span></div>` : ''}
      <div class="divider"></div><div><strong>Cliente:</strong></div><div>${order.clientName}</div><div>${order.clientPhone}</div>
      ${order.address ? `<div style="margin-top:4px"><strong>Endereço:</strong></div><div>${order.address}</div>` : ''}
      ${order.description ? `<div class="divider"></div><div><strong>Descrição:</strong></div><div>${order.description}</div>` : ''}
      <div class="divider"></div><div><strong>Serviços:</strong></div>${order.services.map(s => `<div class="service"><div>${s.name}</div><div class="row"><span>${s.quantity}x R$ ${s.price.toFixed(2)}</span><span>R$ ${(s.quantity * s.price).toFixed(2)}</span></div></div>`).join('')}
      <div class="divider"></div>
      <div class="row"><span>Subtotal:</span><span>R$ ${order.subtotal.toFixed(2)}</span></div>
      ${order.discount > 0 ? `<div class="row"><span>Desconto:</span><span>- R$ ${order.discount.toFixed(2)}</span></div>` : ''}
      <div class="row total"><span>TOTAL:</span><span>R$ ${order.total.toFixed(2)}</span></div>
      ${order.observations ? `<div class="divider"></div><div><strong>Obs:</strong></div><div>${order.observations}</div>` : ''}
      <div class="footer"><div class="divider"></div><div>Obrigado pela preferência!</div><div>OSApp - Sistema de Ordens</div></div></body></html>`;
    const printWindow = window.open('', '_blank');
    if (printWindow) { printWindow.document.write(printContent); printWindow.document.close(); printWindow.print(); }
    toast({ title: "Preparando impressão", description: "A janela de impressão será aberta." });
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`*ORDEM DE SERVIÇO #${order.id}*\n\n📅 Data: ${formatDate(order.date)}\n📋 Status: ${statusLabels[order.status]}${order.priority ? `\n⚡ Prioridade: ${priorityLabels[order.priority]}` : ''}${order.scheduledDate ? `\n🗓️ Agendado: ${formatDate(order.scheduledDate)}${order.scheduledTime ? ` às ${order.scheduledTime}` : ''}` : ''}\n\n👤 *Cliente:* ${order.clientName}${order.address ? `\n📍 ${order.address}` : ''}${order.description ? `\n\n📝 *Descrição:*\n${order.description}` : ''}\n\n🔧 *Serviços:*\n${order.services.map(s => `• ${s.name} (${s.quantity}x) - R$ ${(s.quantity * s.price).toFixed(2)}`).join('\n')}${order.discount > 0 ? `\n\n🏷️ Desconto: - R$ ${order.discount.toFixed(2)}` : ''}\n\n💰 *Total: R$ ${order.total.toFixed(2)}*${order.observations ? `\n\n📝 *Obs:* ${order.observations}` : ''}`);
    const phone = order.clientPhone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
    toast({ title: "Abrindo WhatsApp", description: "A ordem será enviada para o cliente." });
  };

  return (
    <div className="page-container bg-background">
      <div className="lg:hidden"><TopNav title="Compartilhar Ordem" showBack /></div>
      <div className="hidden lg:block"><DesktopHeader title={`Compartilhar Ordem #${order.id}`} /></div>

      <div className="content-container">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="card-elevated p-4 mb-6 lg:mb-0 animate-fade-in">
            <h3 className="font-semibold mb-3">Prévia (80mm)</h3>
            <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs max-w-[300px] mx-auto">
              <div className="text-center mb-3"><p className="font-bold text-sm">ORDEM DE SERVIÇO</p><p>#{order.id}</p></div>
              <div className="border-t border-dashed border-border my-2" />
              <div className="flex justify-between"><span>Data:</span><span>{formatDate(order.date)}</span></div>
              <div className="flex justify-between"><span>Status:</span><span>{statusLabels[order.status]}</span></div>
              {order.priority && <div className="flex justify-between"><span>Prioridade:</span><span>{priorityLabels[order.priority]}</span></div>}
              {order.scheduledDate && <div className="flex justify-between"><span>Agendado:</span><span>{formatDate(order.scheduledDate)} {order.scheduledTime}</span></div>}
              <div className="border-t border-dashed border-border my-2" />
              <p className="font-bold">Cliente:</p><p>{order.clientName}</p><p>{order.clientPhone}</p>
              {order.address && <><p className="font-bold mt-1">Endereço:</p><p>{order.address}</p></>}
              {order.description && <><div className="border-t border-dashed border-border my-2" /><p className="font-bold">Descrição:</p><p>{order.description}</p></>}
              <div className="border-t border-dashed border-border my-2" /><p className="font-bold">Serviços:</p>
              {order.services.map((s, i) => <div key={i} className="mt-1"><p>{s.name}</p><div className="flex justify-between"><span>{s.quantity}x R$ {s.price.toFixed(2)}</span><span>R$ {(s.quantity * s.price).toFixed(2)}</span></div></div>)}
              <div className="border-t border-dashed border-border my-2" />
              <div className="flex justify-between"><span>Subtotal:</span><span>R$ {order.subtotal.toFixed(2)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-status-finished"><span>Desconto:</span><span>- R$ {order.discount.toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold"><span>TOTAL:</span><span>R$ {order.total.toFixed(2)}</span></div>
              {order.observations && <><div className="border-t border-dashed border-border my-2" /><p className="font-bold">Obs:</p><p>{order.observations}</p></>}
            </div>
          </div>

          <div className="space-y-3 animate-slide-up">
            <Button onClick={handlePrint} className="w-full btn-primary"><Printer className="w-5 h-5 mr-2" />Imprimir (80mm)</Button>
            <Button onClick={handleWhatsApp} className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white"><MessageCircle className="w-5 h-5 mr-2" />Enviar via WhatsApp</Button>
            <Button onClick={() => navigate(`/ordens/${id}`)} variant="outline" className="w-full"><ArrowLeft className="w-4 h-4 mr-2" />Voltar para Ordem</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
