import nodemailer from "nodemailer"

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  async sendEmail(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: `"Synvia Platform" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        attachments,
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log("Email enviado:", result.messageId)
      return result
    } catch (error) {
      console.error("Erro ao enviar email:", error)
      throw error
    }
  }

  async sendLowStockAlert(produtos, recipients) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4A7C59; color: white; padding: 20px; text-align: center;">
          <h1>🥖 Synvia Platform</h1>
          <h2>Alerta de Estoque Baixo</h2>
        </div>
        
        <div style="padding: 20px; background-color: #fff3cd; border-left: 4px solid #ffc107;">
          <h3 style="color: #856404; margin-top: 0;">⚠️ Atenção: Produtos com estoque baixo</h3>
          <p style="color: #856404;">
            Os seguintes produtos estão com estoque abaixo do mínimo recomendado:
          </p>
        </div>

        <div style="padding: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Produto</th>
                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">Estoque Atual</th>
                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">Estoque Mínimo</th>
                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${produtos
                .map(
                  (produto) => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${produto.nome}</td>
                  <td style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6; color: ${produto.qtdAtual === 0 ? "#dc3545" : "#ffc107"}; font-weight: bold;">
                    ${produto.qtdAtual}
                  </td>
                  <td style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">${produto.qtdMinima || 5}</td>
                  <td style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">
                    <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; background-color: ${produto.qtdAtual === 0 ? "#f8d7da" : "#fff3cd"}; color: ${produto.qtdAtual === 0 ? "#721c24" : "#856404"};">
                      ${produto.qtdAtual === 0 ? "🚨 ZERADO" : "⚠️ BAIXO"}
                    </span>
                  </td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div style="padding: 20px; background-color: #f8f9fa; text-align: center;">
          <p style="margin: 0; color: #6c757d;">
            <strong>Recomendação:</strong> Realize a reposição destes produtos o mais breve possível para evitar rupturas de estoque.
          </p>
          <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 12px;">
            Este é um email automático do sistema Synvia Platform - Synvia Platform
          </p>
        </div>
      </div>
    `

    for (const recipient of recipients) {
      await this.sendEmail(recipient, "🚨 Alerta de Estoque Baixo - Synvia Platform", html)
    }
  }

  async sendSalesReport(relatorio, recipients) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4A7C59; color: white; padding: 20px; text-align: center;">
          <h1>🥖 Synvia Platform</h1>
          <h2>Relatório Diário de Vendas</h2>
          <p style="margin: 0;">${new Date().toLocaleDateString("pt-BR")}</p>
        </div>

        <div style="padding: 20px;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div style="background-color: #d4edda; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #155724; margin-bottom: 4px;">
                R$ ${relatorio.totalVendas.toFixed(2)}
              </div>
              <div style="color: #155724; font-size: 14px;">Total de Vendas</div>
            </div>
            
            <div style="background-color: #d1ecf1; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #0c5460; margin-bottom: 4px;">
                ${relatorio.quantidadeVendas}
              </div>
              <div style="color: #0c5460; font-size: 14px;">Transações</div>
            </div>
            
            <div style="background-color: #fff3cd; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #856404; margin-bottom: 4px;">
                R$ ${(relatorio.totalVendas / relatorio.quantidadeVendas).toFixed(2)}
              </div>
              <div style="color: #856404; font-size: 14px;">Ticket Médio</div>
            </div>
          </div>

          <h3 style="color: #4A7C59; margin-bottom: 16px;">Produtos Mais Vendidos</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Posição</th>
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Produto</th>
                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">Quantidade</th>
              </tr>
            </thead>
            <tbody>
              ${relatorio.produtosMaisVendidos
                .map(
                  (produto, index) => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #4A7C59;">
                    #${index + 1}
                  </td>
                  <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${produto.nome}</td>
                  <td style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6; font-weight: bold;">
                    ${produto.quantidade}
                  </td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div style="padding: 20px; background-color: #f8f9fa; text-align: center;">
          <p style="margin: 0; color: #6c757d; font-size: 12px;">
            Relatório gerado automaticamente pelo sistema Synvia Platform - Synvia Platform
          </p>
        </div>
      </div>
    `

    for (const recipient of recipients) {
      await this.sendEmail(recipient, `📊 Relatório Diário de Vendas - ${new Date().toLocaleDateString("pt-BR")}`, html)
    }
  }

  async sendBackupNotification(backupInfo, recipients) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4A7C59; color: white; padding: 20px; text-align: center;">
          <h1>🥖 Synvia Platform</h1>
          <h2>Backup Realizado com Sucesso</h2>
        </div>

        <div style="padding: 20px; background-color: #d4edda; border-left: 4px solid #28a745;">
          <h3 style="color: #155724; margin-top: 0;">✅ Backup Concluído</h3>
          <p style="color: #155724;">
            O backup automático do sistema foi realizado com sucesso.
          </p>
        </div>

        <div style="padding: 20px;">
          <h3 style="color: #4A7C59;">Informações do Backup</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Data/Hora:</td>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${new Date(backupInfo.timestamp).toLocaleString("pt-BR")}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Versão:</td>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${backupInfo.version}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Tamanho:</td>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${backupInfo.size || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Status:</td>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; color: #28a745; font-weight: bold;">Sucesso</td>
            </tr>
          </table>
        </div>

        <div style="padding: 20px; background-color: #f8f9fa; text-align: center;">
          <p style="margin: 0; color: #6c757d;">
            <strong>Importante:</strong> Mantenha seus backups em local seguro e teste a restauração periodicamente.
          </p>
          <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 12px;">
            Este é um email automático do sistema Synvia Platform - Synvia Platform
          </p>
        </div>
      </div>
    `

    for (const recipient of recipients) {
      await this.sendEmail(recipient, "✅ Backup Realizado com Sucesso - Synvia Platform", html)
    }
  }

  async sendNewUserNotification(usuario, recipients) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4A7C59; color: white; padding: 20px; text-align: center;">
          <h1>🥖 Synvia Platform</h1>
          <h2>Novo Usuário Cadastrado</h2>
        </div>

        <div style="padding: 20px;">
          <h3 style="color: #4A7C59;">Informações do Usuário</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Nome:</td>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${usuario.nome}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Email:</td>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${usuario.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Perfil:</td>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${usuario.perfil}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6; font-weight: bold;">Data de Criação:</td>
              <td style="padding: 8px; border-bottom: 1px solid #dee2e6;">${new Date().toLocaleString("pt-BR")}</td>
            </tr>
          </table>
        </div>

        <div style="padding: 20px; background-color: #f8f9fa; text-align: center;">
          <p style="margin: 0; color: #6c757d; font-size: 12px;">
            Notificação automática do sistema Synvia Platform - Synvia Platform
          </p>
        </div>
      </div>
    `

    for (const recipient of recipients) {
      await this.sendEmail(recipient, "👤 Novo Usuário Cadastrado - Synvia Platform", html)
    }
  }
}

export const emailService = new EmailService()
